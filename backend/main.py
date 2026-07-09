import uuid
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

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
)
from schemas.models import ChatRequest

from dotenv import load_dotenv

load_dotenv()

# --------------- map navigation helpers ---------------
_LOCATION_MAP: dict[str, dict] = {
    "whitefield":     {"lat": 12.9698, "lng": 77.7500, "zoom": 15, "label": "Whitefield"},
    "koramangala":    {"lat": 12.9352, "lng": 77.6245, "zoom": 15, "label": "Koramangala"},
    "electronic city":{"lat": 12.8452, "lng": 77.6602, "zoom": 14, "label": "Electronic City"},
    "shivajinagar":   {"lat": 12.9857, "lng": 77.6057, "zoom": 15, "label": "Shivajinagar"},
    "mg road":        {"lat": 12.9716, "lng": 77.5946, "zoom": 16, "label": "MG Road"},
    "indiranagar":    {"lat": 12.9719, "lng": 77.6412, "zoom": 15, "label": "Indiranagar"},
    "yeshwanthpur":   {"lat": 13.0284, "lng": 77.5541, "zoom": 14, "label": "Yeshwanthpur"},
    "bangalore":      {"lat": 12.9716, "lng": 77.5946, "zoom": 11, "label": "Bangalore"},
    "bengaluru":      {"lat": 12.9716, "lng": 77.5946, "zoom": 11, "label": "Bengaluru"},
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


app = FastAPI(title="KIRA Console — Conversational AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """
    Main conversational AI endpoint.
    Streams two SSE events:
      1. workspace_signal (~200ms) — Cerebras router result, triggers frontend animation
      2. narration (~1-2s)        — Gemini response text for the chat panel
    """
    session_id = req.session_id or str(uuid.uuid4())

    async def generate():
        session = await get_or_create_session(session_id, req.lang)
        current_workspace = session.get("current_workspace", "supervision")
        current_entity = session.get("current_entity")

        lang = req.lang
        if lang == "en":
            detected = await detect_language(req.query)
            if detected == "kn":
                lang = "kn"

        context_string = await get_recent_context_string(session_id)

        await save_message(session_id, "officer", req.query)

        routing = await classify_intent(
            query=req.query,
            current_workspace=current_workspace,
            current_entity=current_entity,
            recent_context=context_string,
        )

        target_workspace = routing.get("workspace", current_workspace)
        action = routing.get("action", "stay")
        entity = routing.get("entity") or current_entity
        confidence = routing.get("confidence", 0.9)
        detected_lang = routing.get("language", lang)
        if detected_lang == "kn":
            lang = "kn"

        agents_running = AGENT_SETS.get(target_workspace, [])

        # Event 1: routing signal — arrives immediately, frontend switches workspace
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

        entity_data = get_entity_data(target_workspace, entity)
        history = await get_history(session_id, limit=8)

        narration = await generate_response(
            query=req.query,
            workspace=target_workspace,
            entity=entity,
            entity_data=entity_data,
            conversation_history=history,
            lang=lang,
        )

        # Event 2: AI narration text + optional map action
        narration_event: dict = {"event": "narration", "text": narration, "lang": lang}
        map_action = extract_map_action(req.query)
        if map_action:
            narration_event["map_action"] = map_action
        yield f"data: {json.dumps(narration_event)}\n\n"

        await update_session(session_id, target_workspace, entity)

        workspace_signal_record = {
            "workspace": target_workspace,
            "action": action,
            "entity": entity,
            "confidence": confidence,
        }
        await save_message(session_id, "ai", narration, workspace_signal_record)

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
async def get_session(session_id: str):
    """Get current session state and last 20 messages."""
    session = await get_or_create_session(session_id)
    history = await get_history(session_id, limit=20)
    return {"session": session, "history": history}


@app.get("/api/suspects/{name}")
async def get_suspect_detail(name: str):
    return {
        "suspect": get_suspect(name),
        "cases": get_suspect_cases(name),
        "evidence": get_suspect_evidence(name),
    }


@app.get("/api/hotspots")
async def get_hotspots_endpoint():
    return get_hotspots()


@app.get("/api/arrests")
async def get_arrests():
    return get_recent_arrests()


@app.get("/api/alerts")
async def get_alerts():
    """
    Rule-based proactive alert generation from live Supabase data.
    Applies thresholds to hotspot + arrest data to surface actionable intelligence.
    """
    from datetime import datetime
    hotspots = get_hotspots()
    arrests = get_recent_arrests(3)

    alerts = []
    now = datetime.now().strftime("%I:%M %p")

    # Rule 1: Emerging high-risk hotspots → immediate surge alert
    for h in hotspots:
        if h.get("emerging") and h.get("risk_score", 0) >= 8.5:
            alerts.append({
                "severity": "critical",
                "border": "#F04E4E",
                "title": f"SURGE ALERT — {h['name']}",
                "body": f"{h['incidents']} incidents detected · {h['crime_type']} cluster flagged · Deploy patrol units",
                "time": now,
            })

    # Rule 2: Non-emerging high risk_score hotspots → escalation watch
    for h in hotspots:
        if not h.get("emerging") and h.get("risk_score", 0) >= 7.0:
            alerts.append({
                "severity": "high",
                "border": "#F5A623",
                "title": f"ESCALATION WATCH — {h['name']}",
                "body": f"{h['incidents']} weekly incidents · {h['crime_type']} · Risk score {h['risk_score']:.1f}/10",
                "time": now,
            })

    # Rule 3: Recent arrest intelligence
    if arrests:
        a = arrests[0]
        alerts.append({
            "severity": "info",
            "border": "#4D9EF5",
            "title": f"ARREST INTELLIGENCE — {a.get('suspect_name', 'Unknown')}",
            "body": f"{a.get('charge', '')} · {a.get('location', '')} · Case {a.get('case_id', '')} updated",
            "time": a.get("arrest_date", now),
        })

    return {"alerts": alerts[:5], "generated_at": now}


@app.get("/api/audit")
async def get_audit_log(limit: int = 50):
    """
    Audit trail — recent officer queries and AI responses across all sessions,
    enriched with workspace routing context and session metadata.
    """
    entries = await get_audit_entries(limit)
    return {"entries": entries, "total": len(entries)}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "KIRA Conversational AI"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
