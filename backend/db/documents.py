import os
from supabase import create_client


def _sb():
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])


def create_document(name: str, uploaded_by: str | None = None) -> dict:
    data: dict = {"name": name}
    if uploaded_by:
        data["uploaded_by"] = uploaded_by
    return _sb().table("documents").insert(data).execute().data[0]


def list_documents() -> list:
    return (
        _sb()
        .table("documents")
        .select("*")
        .order("created_at", desc=True)
        .execute()
        .data
    )


def update_chunk_count(document_id: str, count: int) -> None:
    _sb().table("documents").update({"chunk_count": count}).eq("id", document_id).execute()


def delete_document(document_id: str) -> None:
    _sb().table("documents").delete().eq("id", document_id).execute()
