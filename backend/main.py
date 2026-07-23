import sys
import uuid
import json
import os
import asyncio

# --------------- env var validation (runs before ANY other import) ---------------
# load_dotenv first so local .env works; in Catalyst the OS env is already populated.
from dotenv import load_dotenv
load_dotenv()

_REQUIRED_ENV = {
    "SUPABASE_URL":         "Supabase project URL (Settings → API → Project URL)",
    "SUPABASE_SERVICE_KEY": "Supabase service_role key (Settings → API → service_role)",
    "CEREBRAS_API_KEY":     "Cerebras cloud API key",
}
_missing = [k for k in _REQUIRED_ENV if not os.environ.get(k)]
if _missing:
    for k in _missing:
        print(f"[KIRA STARTUP ERROR] Missing env var: {k}  — {_REQUIRED_ENV[k]}", flush=True)
    print(f"[KIRA STARTUP ERROR] {len(_missing)} required env var(s) not set. Cannot start.", flush=True)
    sys.exit(1)

print("[KIRA STARTUP] All required env vars present — starting imports", flush=True)

# --------------- standard imports ---------------
from fastapi import FastAPI, Header, HTTPException, Depends, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
import jwt as pyjwt
from jwt import PyJWKClient

from agents.router import classify_intent
from agents.responder import generate_response, AGENT_SETS
from agents.translator import detect_language
from memory.supabase_memory import (
    get_or_create_session,
    update_session,
    save_message,
    get_history,
    get_recent_context_string,
    get_audit_entries,
)
from db.entities import (
    get_entity_data,
    get_hotspots,
    get_recent_arrests,
    get_suspect,
    get_suspect_cases,
    get_suspect_evidence,
    get_user_profile,
)
from db.documents import (
    create_document,
    list_documents,
    update_chunk_count,
    delete_document as delete_document_record,
)
from schemas.models import ChatRequest

SUPABASE_URL = os.environ["SUPABASE_URL"]
# PyJWKClient fetches Supabase's public JWKS, caches keys, and auto-selects
# the right key per token `kid`. Supports ES256 (asymmetric) out of the box.
_jwks_client = PyJWKClient(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json", cache_keys=True)

# --------------- map navigation helpers ---------------
_LOCATION_MAP: dict[str, dict] = {
    "whitefield":      {"lat": 12.9698, "lng": 77.7500, "zoom": 15, "label": "Whitefield"},
    "koramangala":     {"lat": 12.9352, "lng": 77.6245, "zoom": 15, "label": "Koramangala"},
    "electronic city": {"lat": 12.8452, "lng": 77.6602, "zoom": 14, "label": "Electronic City"},
    "shivajinagar":    {"lat": 12.9857, "lng": 77.6057, "zoom": 15, "label": "Shivajinagar"},
    "mg road":         {"lat": 12.9716, "lng": 77.5946, "zoom": 16, "label": "MG Road"},
    "indiranagar":     {"lat": 12.9719, "lng": 77.6412, "zoom": 15, "label": "Indiranagar"},
    "yeshwanthpur":    {"lat": 13.0284, "lng": 77.5541, "zoom": 14, "label": "Yeshwanthpur"},
    "bangalore":       {"lat": 12.9716, "lng": 77.5946, "zoom": 11, "label": "Bangalore"},
    "bengaluru":       {"lat": 12.9716, "lng": 77.5946, "zoom": 11, "label": "Bengaluru"},
}
_NAV_KEYWORDS = {"zoom", "show", "focus", "center", "map", "hotspot", "go to", "take me", "navigate", "where is", "locate", "fly to"}


def extract_map_action(query: str) -> dict | None:
    """Return map coordinates if the query is a location/navigation request."""
    q = query.lower()
    if not any(kw in q for kw in _NAV_KEYWORDS):
        return None
    for loc, coords in _LOCATION_MAP.items():
        if loc in q:
            return coords
    return None


# --------------- auth dependency ---------------

async def get_current_user(authorization: str = Header(None)) -> dict:
    """Validate the Supabase JWT and return the authenticated officer's profile."""
    if not authorization or not authorization.startswith("Bearer "):
        print("[KIRA backend] get_current_user: missing or malformed Authorization header")
        raise HTTPException(status_code=401, detail="Missing authentication token")

    token = authorization.split(" ", 1)[1]
    print(f"[KIRA backend] get_current_user: decoding token (prefix: {token[:20]}…)")

    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
        payload = pyjwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
        user_id = payload["sub"]
        exp = payload.get("exp")
        print(f"[KIRA backend] get_current_user: token valid — user_id={user_id}, exp={exp}")
    except pyjwt.ExpiredSignatureError:
        print("[KIRA backend] get_current_user: token EXPIRED")
        raise HTTPException(status_code=401, detail="Token has expired — please sign in again")
    except Exception as e:
        print(f"[KIRA backend] get_current_user: token decode failed — {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    profile = await asyncio.to_thread(get_user_profile, user_id)
    if not profile:
        print(f"[KIRA backend] get_current_user: no profile found for user_id={user_id}")
        raise HTTPException(status_code=403, detail="No officer profile found for this account")

    print(f"[KIRA backend] get_current_user: authorized — {profile['full_name']} ({profile['role']})")
    return {
        "user_id": user_id,
        "role": profile["role"],
        "full_name": profile["full_name"],
        "badge_number": profile.get("badge_number"),
    }


_POLICYMAKER_SUSPECT_BLOCK = (
    "Individual suspect records are restricted for your role. "
    "Aggregate cluster statistics are available — would you like a "
    "summary of Cluster K-7 activity instead?"
)


# --------------- app ---------------

app = FastAPI(title="KIRA Console — Conversational AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
}

# ZGS (Zoho Gateway Server) strips Access-Control-Request-Method from OPTIONS
# before forwarding to FastAPI, so CORSMiddleware never fires its preflight logic.
# Explicit OPTIONS handlers return CORS headers unconditionally.
@app.options("/api/{path:path}")
def options_handler():
    return Response(status_code=200, headers=_CORS_HEADERS)


@app.post("/api/chat")
async def chat(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    """
    Main conversational AI endpoint.
    Streams two SSE events:
      1. workspace_signal (~200ms) — Cerebras router result, triggers frontend animation
      2. narration (~1-2s)        — Gemini response text for the chat panel
    Requires a valid Supabase JWT. Enforces role-based content restrictions.
    """
    session_id = req.session_id or str(uuid.uuid4())
    user_id = current_user["user_id"]
    officer_role = current_user["role"]

    async def generate():
        # Yield immediately so CORS + SSE headers are flushed before any blocking I/O.
        # AppSail's proxy drops silent connections; this heartbeat keeps it alive.
        yield f"data: {json.dumps({'event': 'heartbeat'})}\n\n"

        session = await asyncio.to_thread(get_or_create_session, session_id, req.lang)
        current_workspace = session.get("current_workspace", "supervision")
        current_entity = session.get("current_entity")

        lang = req.lang
        if lang == "en":
            detected = await detect_language(req.query)
            if detected == "kn":
                lang = "kn"

        context_string = await asyncio.to_thread(get_recent_context_string, session_id)
        await asyncio.to_thread(save_message, session_id, "officer", req.query, user_id)

        routing = await asyncio.to_thread(
            classify_intent,
            req.query,
            current_workspace,
            current_entity,
            context_string,
        )

        target_workspace = routing.get("workspace", current_workspace)
        action = routing.get("action", "stay")
        entity = routing.get("entity") or current_entity
        confidence = routing.get("confidence", 0.9)
        detected_lang = routing.get("language", lang)
        if detected_lang == "kn":
            lang = "kn"

        agents_running = AGENT_SETS.get(target_workspace, [])

        # Policymaker restriction: block individual suspect queries
        if officer_role == "policymaker" and target_workspace == "suspect":
            signal_event = {
                "event": "workspace_signal",
                "workspace": "supervision",
                "action": "stay",
                "entity": None,
                "agents_running": [],
                "confidence": 1.0,
                "lang": lang,
            }
            yield f"data: {json.dumps(signal_event)}\n\n"
            yield f"data: {json.dumps({'event': 'narration', 'text': _POLICYMAKER_SUSPECT_BLOCK, 'lang': lang})}\n\n"
            await asyncio.to_thread(save_message, session_id, "ai", _POLICYMAKER_SUSPECT_BLOCK, user_id)
            yield f"data: {json.dumps({'event': 'done', 'session_id': session_id})}\n\n"
            return

        # Event 1: routing signal
        signal_event = {
            "event": "workspace_signal",
            "workspace": target_workspace,
            "action": action,
            "entity": entity,
            "agents_running": agents_running,
            "confidence": confidence,
            "lang": lang,
        }
        yield f"data: {json.dumps(signal_event)}\n\n"

        entity_data = await asyncio.to_thread(get_entity_data, target_workspace, entity)
        history = await asyncio.to_thread(get_history, session_id, 8)

        rag_context: list[str] = []
        try:
            from agents.rag import retrieve_context
            rag_context = await asyncio.to_thread(retrieve_context, req.query)
        except Exception as rag_err:
            print(f"[RAG] Retrieval skipped: {rag_err}")

        narration = await asyncio.to_thread(
            generate_response,
            req.query,
            target_workspace,
            entity,
            entity_data,
            history,
            lang,
            rag_context,
        )

        # Event 2: AI narration text + optional map action
        narration_event: dict = {"event": "narration", "text": narration, "lang": lang}
        map_action = extract_map_action(req.query)
        if map_action:
            narration_event["map_action"] = map_action
        yield f"data: {json.dumps(narration_event)}\n\n"

        await asyncio.to_thread(update_session, session_id, target_workspace, entity)

        workspace_signal_record = {
            "workspace": target_workspace,
            "action": action,
            "entity": entity,
            "confidence": confidence,
        }
        await asyncio.to_thread(
            save_message, session_id, "ai", narration, user_id, workspace_signal_record
        )

        yield f"data: {json.dumps({'event': 'done', 'session_id': session_id})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.get("/api/session/{session_id}")
def get_session(session_id: str):
    session = get_or_create_session(session_id)
    history = get_history(session_id, limit=20)
    return {"session": session, "history": history}


@app.get("/api/suspects/{name}")
def get_suspect_detail(name: str):
    return {
        "suspect": get_suspect(name),
        "cases": get_suspect_cases(name),
        "evidence": get_suspect_evidence(name),
    }


@app.get("/api/hotspots")
def get_hotspots_endpoint():
    return get_hotspots()


@app.get("/api/arrests")
def get_arrests():
    return get_recent_arrests()


@app.get("/api/alerts")
def get_alerts():
    """Rule-based proactive alert generation from live Supabase data."""
    from datetime import datetime
    hotspots = get_hotspots()
    arrests = get_recent_arrests(3)
    alerts = []
    now = datetime.now().strftime("%I:%M %p")

    for h in hotspots:
        if h.get("emerging") and h.get("risk_score", 0) >= 8.5:
            alerts.append({
                "severity": "critical", "border": "#F04E4E",
                "title": f"SURGE ALERT — {h['name']}",
                "body": f"{h['incidents']} incidents detected · {h['crime_type']} cluster flagged · Deploy patrol units",
                "time": now,
            })

    for h in hotspots:
        if not h.get("emerging") and h.get("risk_score", 0) >= 7.0:
            alerts.append({
                "severity": "high", "border": "#F5A623",
                "title": f"ESCALATION WATCH — {h['name']}",
                "body": f"{h['incidents']} weekly incidents · {h['crime_type']} · Risk score {h['risk_score']:.1f}/10",
                "time": now,
            })

    if arrests:
        a = arrests[0]
        alerts.append({
            "severity": "info", "border": "#4D9EF5",
            "title": f"ARREST INTELLIGENCE — {a.get('suspect_name', 'Unknown')}",
            "body": f"{a.get('charge', '')} · {a.get('location', '')} · Case {a.get('case_id', '')} updated",
            "time": a.get("arrest_date", now),
        })

    return {"alerts": alerts[:5], "generated_at": now}


@app.get("/api/audit")
def get_audit_log(
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
):
    """
    Audit trail. Supervisors see all officers' history; others see only their own.
    """
    entries = get_audit_entries(
        limit=limit,
        requesting_user_id=current_user["user_id"],
        requesting_role=current_user["role"],
    )
    return {"entries": entries, "total": len(entries)}


@app.get("/api/financial/trail/{entity}")
def money_trail(entity: str):
    """Directed graph traversal — downstream money trail up to 4 hops from a named entity."""
    from agents.financial_analysis import trace_money_trail
    return trace_money_trail(entity)


@app.get("/api/financial/layering/{case_id}")
def layering_analysis(case_id: str):
    """Detect money-laundering layering indicators for a case (multi-hop, structuring, cash-out)."""
    from agents.financial_analysis import detect_layering_pattern
    return detect_layering_pattern(case_id)


@app.get("/api/suspects/{name}/risk")
def suspect_risk_score(name: str):
    """Computed actuarial risk score with contributing factor breakdown."""
    from agents.risk_scoring import get_risk_score_for_suspect
    return get_risk_score_for_suspect(name)


@app.get("/api/cases/{case_id}/similar")
def similar_cases_endpoint(case_id: str):
    """Semantic case similarity using sentence embeddings (all-MiniLM-L6-v2, cosine similarity)."""
    from agents.similar_cases import find_similar_cases
    return {"similar_cases": find_similar_cases(case_id)}


@app.get("/api/network/analysis")
def network_analysis_endpoint():
    """
    Real graph-based network analysis using networkx + Louvain community detection.
    Builds the criminal network from live suspect/case/evidence/gang_members data.
    """
    from agents.network_analysis import detect_communities, get_centrality_scores
    communities = detect_communities()
    centrality = get_centrality_scores()
    return {"communities": communities, "centrality": centrality}


@app.post("/api/documents")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 20 MB)")

    from agents.rag import extract_pdf_text, chunk_text, index_document
    text = await asyncio.to_thread(extract_pdf_text, content)
    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from PDF")

    chunks = chunk_text(text)
    document = await asyncio.to_thread(create_document, file.filename, current_user["user_id"])
    await asyncio.to_thread(index_document, document["id"], file.filename, chunks)
    await asyncio.to_thread(update_chunk_count, document["id"], len(chunks))

    print(f"[RAG] Indexed {len(chunks)} chunks for '{file.filename}' (doc {document['id']})")
    return {"id": document["id"], "name": file.filename, "chunk_count": len(chunks)}


@app.get("/api/documents")
async def list_documents_endpoint():
    return {"documents": list_documents()}


@app.delete("/api/documents/{document_id}")
async def delete_document_endpoint(
    document_id: str,
    current_user: dict = Depends(get_current_user),
):
    await asyncio.to_thread(delete_document_record, document_id)
    return {"deleted": document_id}


@app.get("/api/catalyst-test")
async def catalyst_test(request: Request):
    from db.catalyst_client import run_zcql_query
    headers = {k.lower(): v for k, v in request.headers.items()}
    def _query():
        return run_zcql_query("SELECT * FROM state", headers)
    return await asyncio.to_thread(_query)


@app.get("/api/seed-status")
async def seed_status(request: Request):
    import requests as req
    import os
    from db.catalyst_client import run_zcql_query
    h = {k.lower(): v for k, v in request.headers.items()}
    project_id = h.get("x-zc-projectid")
    token = h.get("x-zc-admin-cred-token")
    cred_type = h.get("x-zc-admin-cred-type", "token")
    secret = h.get("x-zc-project-secret-key", "")
    env = h.get("x-zc-environment", "Development")
    base = os.environ.get("X_ZOHO_CATALYST_CONSOLE_URL", "https://api.catalyst.zoho.in")
    auth = f"Zoho-ticket {token}" if cred_type == "ticket" else f"Zoho-oauthtoken {token}"

    def _check():
        # List all table names
        r = req.get(f"{base}/baas/v1/project/{project_id}/table",
                    headers={"Authorization": auth, "X-ZC-PROJECT-SECRET-KEY": secret, "Environment": env},
                    timeout=15)
        all_tables = [t["table_name"] for t in r.json().get("data", [])] if r.ok else [f"err:{r.status_code}"]

        # Current counts in each transactional table
        counts = {}
        for t in ["CaseMaster", "ComplainantDetails", "Victim", "Accused", "ArrestSurrender", "ActSectionAssociation"]:
            try:
                res = run_zcql_query(f"SELECT * FROM {t}", h)
                counts[t] = {"count": len(res.get("data", [])), "data": res.get("data", [])}
            except Exception as e:
                counts[t] = {"error": str(e)[:200]}

        # Try act/section table name variants
        act_tries = {}
        for name in ["Act", "act", "ActMaster"]:
            try:
                res = run_zcql_query(f"SELECT * FROM {name}", h)
                act_tries[name] = res.get("data", [])
            except Exception as e:
                act_tries[name] = str(e)[:150]

        sec_tries = {}
        for name in ["section", "Section", "SectionMaster"]:
            try:
                res = run_zcql_query(f"SELECT * FROM {name}", h)
                sec_tries[name] = res.get("data", [])
            except Exception as e:
                sec_tries[name] = str(e)[:150]

        return {"all_tables": all_tables, "transactional_counts": counts, "act_tries": act_tries, "sec_tries": sec_tries}

    return await asyncio.to_thread(_check)


@app.get("/api/seed-case")
async def seed_case(request: Request):
    from db.catalyst_client import run_zcql_query
    h = {k.lower(): v for k, v in request.headers.items()}
    results = {}

    def _seed():
        # ActSectionAssociation — ActID/SectionID are varchar (ActCode/SectionCode)
        try:
            run_zcql_query(
                "INSERT INTO ActSectionAssociation (CaseMasterID, ActID, SectionID, ActOrderID, SectionOrderID) "
                "VALUES (1, 'NDPS', '21', 1, 1)",
                h
            )
            results["ActSection_NDPS21"] = "ok"
        except Exception as e:
            results["ActSection_NDPS21_error"] = str(e)[:400]

        try:
            run_zcql_query(
                "INSERT INTO ActSectionAssociation (CaseMasterID, ActID, SectionID, ActOrderID, SectionOrderID) "
                "VALUES (1, 'PMLA', '3', 2, 1)",
                h
            )
            results["ActSection_PMLA3"] = "ok"
        except Exception as e:
            results["ActSection_PMLA3_error"] = str(e)[:400]

        try:
            run_zcql_query(
                "INSERT INTO ActSectionAssociation (CaseMasterID, ActID, SectionID, ActOrderID, SectionOrderID) "
                "VALUES (1, 'PMLA', '4', 2, 2)",
                h
            )
            results["ActSection_PMLA4"] = "ok"
        except Exception as e:
            results["ActSection_PMLA4_error"] = str(e)[:400]

        return results

    return await asyncio.to_thread(_seed)


@app.get("/api/case-catalyst")
async def case_catalyst(request: Request):
    from db.entities import get_case_from_catalyst, get_victims_from_catalyst, get_accused_from_catalyst
    h = {k.lower(): v for k, v in request.headers.items()}
    def _fetch():
        return {
            "case": get_case_from_catalyst(1, h),
            "victims": get_victims_from_catalyst(1, h),
            "accused": get_accused_from_catalyst(1, h),
        }
    return await asyncio.to_thread(_fetch)


@app.get("/api/version-check")
def version_check():
    return {"version": "seed-v8-catalyst-reads", "ts": "2026-07-23-f"}


@app.get("/health")
def health():
    return {"status": "ok", "service": "KIRA Conversational AI"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
