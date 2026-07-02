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

        # Event 2: AI narration text
        narration_event = {
            "event": "narration",
            "text": narration,
            "lang": lang,
        }
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


@app.get("/health")
async def health():
    return {"status": "ok", "service": "KIRA Conversational AI"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
