from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    query: str
    session_id: str
    lang: str = "en"
    current_workspace: str = "supervision"
    current_entity: Optional[str] = None


class WorkspaceSignal(BaseModel):
    workspace: str
    action: str
    entity: Optional[str] = None
    narration: str
    agents_running: list[str] = []
    confidence: float = 0.9


class ChatResponse(BaseModel):
    session_id: str
    signal: WorkspaceSignal
    lang: str
