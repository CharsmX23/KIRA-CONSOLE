-- KIRA RAG setup — run ONCE in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Creates the pgvector table + search function that agents/rag.py expects.
-- Embedding dimension 768 = Google Gemini "text-embedding-004".

-- 1. pgvector extension
create extension if not exists vector;

-- 2. document_chunks table (one row per chunk of an uploaded PDF)
create table if not exists document_chunks (
  id            bigserial primary key,
  document_id   text,
  document_name text,
  chunk_index   int,
  content       text,
  embedding     vector(768),
  created_at    timestamptz default now()
);

-- 3. cosine-similarity index for fast retrieval
create index if not exists document_chunks_embedding_idx
  on document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 4. match function called by retrieve_context() via sb.rpc("match_document_chunks", ...)
-- Drop any pre-existing version first — Postgres can't change a function's return type via
-- CREATE OR REPLACE (error 42P13). This drops the known signature.
drop function if exists match_document_chunks(vector, double precision, integer);

-- Returns only content + similarity — retrieve_context() only reads row["content"], so we
-- avoid declaring id/document_id types that must match the (possibly uuid) existing table.
create or replace function match_document_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count     int
)
returns table (
  content    text,
  similarity float
)
language sql stable
as $$
  select
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;
