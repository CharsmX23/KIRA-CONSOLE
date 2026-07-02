import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_KEY"],
)


async def get_or_create_session(session_id: str, lang: str = "en") -> dict:
    """Get existing session or create a new one."""
    result = supabase.table("sessions").select("*").eq("id", session_id).execute()

    if result.data:
        return result.data[0]

    new_session = {
        "id": session_id,
        "lang": lang,
        "current_workspace": "supervision",
        "current_entity": None,
    }
    supabase.table("sessions").insert(new_session).execute()
    return new_session


async def update_session(session_id: str, workspace: str, entity: str | None):
    """Update session with current workspace and entity."""
    supabase.table("sessions").update({
        "current_workspace": workspace,
        "current_entity": entity,
        "updated_at": "NOW()",
    }).eq("id", session_id).execute()


async def save_message(
    session_id: str,
    role: str,
    content: str,
    workspace_signal: dict | None = None,
):
    """Save a message to conversation history."""
    supabase.table("messages").insert({
        "session_id": session_id,
        "role": role,
        "content": content,
        "workspace_signal": workspace_signal,
    }).execute()


async def get_history(session_id: str, limit: int = 8) -> list[dict]:
    """
    Get last N messages for context window.
    Returns list of {"role": "officer"|"ai", "content": "..."}
    """
    result = (
        supabase.table("messages")
        .select("role, content")
        .eq("session_id", session_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    messages = list(reversed(result.data)) if result.data else []
    return messages


async def get_recent_context_string(session_id: str) -> str:
    """
    Get last 3 exchanges as a plain string for the router.
    Example: "Officer: Tell me about R. Mehta | AI: R. Mehta is HIGH RISK..."
    """
    messages = await get_history(session_id, limit=6)
    parts = []
    for msg in messages:
        label = "Officer" if msg["role"] == "officer" else "AI"
        parts.append(f"{label}: {msg['content'][:100]}")
    return " | ".join(parts) if parts else "No previous context"
