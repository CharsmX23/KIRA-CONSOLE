import os
from typing import List

import fitz  # PyMuPDF
import google.generativeai as genai
from supabase import create_client

_genai_configured = False


def _configure_genai():
    global _genai_configured
    if not _genai_configured:
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            raise RuntimeError("[RAG] GEMINI_API_KEY not set — embeddings unavailable")
        genai.configure(api_key=key)
        _genai_configured = True


def _sb():
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])


def extract_pdf_text(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = [page.get_text() for page in doc]
    doc.close()
    return "\n\n".join(pages)


def chunk_text(text: str, size: int = 1500, overlap: int = 150) -> List[str]:
    chunks, start = [], 0
    while start < len(text):
        chunk = text[start : start + size].strip()
        if chunk:
            chunks.append(chunk)
        start += size - overlap
    return chunks


def _embed(texts: List[str], task: str = "retrieval_document") -> List[List[float]]:
    _configure_genai()
    return [
        genai.embed_content(
            model="models/text-embedding-004",
            content=txt,
            task_type=task,
        )["embedding"]
        for txt in texts
    ]


def index_document(document_id: str, document_name: str, chunks: List[str]) -> None:
    embeddings = _embed(chunks)
    rows = [
        {
            "document_id": document_id,
            "document_name": document_name,
            "chunk_index": i,
            "content": chunk,
            "embedding": emb,
        }
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings))
    ]
    sb = _sb()
    for i in range(0, len(rows), 50):
        sb.table("document_chunks").insert(rows[i : i + 50]).execute()


def retrieve_context(query: str, match_count: int = 4) -> List[str]:
    query_emb = _embed([query], task="retrieval_query")[0]
    sb = _sb()
    resp = sb.rpc("match_document_chunks", {
        "query_embedding": query_emb,
        "match_threshold": 0.55,
        "match_count": match_count,
    }).execute()
    return [row["content"] for row in (resp.data or [])]
