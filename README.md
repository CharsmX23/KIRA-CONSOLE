# KIRA Console

**AI-Powered Conversational Police Intelligence Platform**

Built for the **Karnataka State Police Hackathon 2026** — Challenge: *"Intelligent Conversational AI for KSP Crime Database"*

🔗 **Live App:** [kira-console.onslate.in](https://kira-console.onslate.in)

---

## Overview

KIRA Console lets police officers query crime intelligence data using natural language instead of navigating fragmented dashboards. Ask "Tell me about Salim Khan" or "Show Whitefield hotspots," and KIRA routes the query, retrieves the relevant suspect, case, or evidence data from a live database, and responds with a grounded, conversational narrative — in English or Kannada.

It's built around a genuine belief that investigative work shouldn't require learning a UI — it should feel like briefing a colleague who already has the file open.

---

## Key Features

- **Conversational AI chat** — LLM-based intent routing directs queries to the right workspace (suspect, case, map, network analysis, arrests, trends)
- **Full suspect dossiers** — identity, risk scoring, evidence chains, linked cases, detention history
- **Evidence chain visualization** — cross-linked CCTV, phone records, financial transactions, physical evidence
- **Gang network analysis** — real graph analysis using NetworkX with Louvain community detection, rendered interactively
- **Explainable risk scoring** — a transparent, weighted formula (not a black-box ML model) with contributing-factor breakdown
- **Similar case retrieval** — TF-IDF + cosine similarity across the case corpus
- **Financial crime tracing** — directed money-trail graph traversal and layering-pattern detection
- **Document Q&A (RAG)** — upload case PDFs; KIRA indexes and grounds its answers in the actual uploaded content
- **Voice input** — hands-free querying for field use
- **Bilingual** — full English and formal Kannada support, including auto-detection
- **Role-based access** — four distinct roles (investigator, analyst, supervisor, policymaker) with different data visibility
- **Audit trail** — full query history, scoped by role
- **Interactive map** — live hotspot visualization with location-aware navigation
- **PDF export** — generate case reports on demand

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend | React + Vite (TypeScript), deployed on **Zoho Catalyst Slate** |
| Backend | FastAPI (Python 3.12), deployed on **Zoho Catalyst AppSail** |
| Database | **Zoho Catalyst Data Store** — 26 tables modeled on the Karnataka Police FIR schema |
| Auth | Supabase Auth (JWT, ES256/JWKS) |
| LLM | Cerebras `gpt-oss-120b` — intent routing + response generation |
| RAG / Embeddings | Supabase pgvector + Google Gemini `text-embedding-004` |
| Graph Analysis | NetworkX (Louvain community detection), Cytoscape.js (rendering) |

### A note on scope

The Data Store migration to Zoho Catalyst — 26 tables, built to the Karnataka Police FIR ER schema provided by the hackathon mentors — was the hard requirement for this challenge, and it's fully done.

Auth, LLM inference, and RAG deliberately remain on their original stack (Supabase Auth, Cerebras, Gemini embeddings) rather than being migrated to Catalyst-native equivalents. This was a considered engineering tradeoff, not an oversight: with a tight timeline, rebuilding a working, tested pipeline against a less-familiar API late in the process was judged higher-risk than the value of full platform consolidation. Every other core requirement of the challenge is met on Catalyst.

---

## Tech Stack

**Frontend:** React, Vite, TypeScript, Tailwind CSS, Leaflet (maps), Recharts, Cytoscape.js, Lucide icons

**Backend:** FastAPI, Python, LangChain/LangGraph patterns, PyJWT (ES256/JWKS)

**AI/LLM:** Cerebras Cloud (`gpt-oss-120b`), Google Gemini (embeddings)

**Data:** Zoho Catalyst Data Store, Supabase (Auth + pgvector), sklearn (TF-IDF)

**Analysis:** NetworkX (graph/community detection), custom weighted risk-scoring engine

**DevOps:** Zoho Catalyst CLI, GitHub (Slate CI/CD via GitHub sync)

---

## Demo Credentials

Four role-based logins are seeded for demo purposes:

| Role | Login | Password |
|---|---|---|
| Investigator | `investigator@ksp.demo` | `KiraDemo@2026` |
| Analyst | `analyst@ksp.demo` | `KiraDemo@2026` |
| Supervisor | `supervisor@ksp.demo` | `KiraDemo@2026` |
| Policymaker | `policymaker@ksp.demo` | `KiraDemo@2026` |

**Demo case:** `KS1207` — Whitefield Police Station, Bengaluru — hawala network, "Cluster K-7"

Try asking KIRA:
- *"Tell me about R. Mehta"*
- *"Tell me about Salim Khan"*
- *"Show emerging threats"*
- *"Whitefield hotspots"*
- *"Active cases today"*

---

## Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt --break-system-packages
# Set required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, CEREBRAS_API_KEY, GEMINI_API_KEY
uvicorn main:app --reload

# Frontend
npm install
npm run dev
```

---

## Known Limitations

- Full detailed dossiers currently exist for two suspects (Rajesh Kumar Mehta, Salim Khan); other named individuals resolve correctly in chat but fall back to a generic dossier view in the investigation panel.
- `get_suspect_evidence` and `get_gang_members` intentionally remain on the original Supabase schema — the Catalyst FIR schema provided for this challenge has no equivalent evidence-tracking or gang/network tables. This is a scoped, documented decision, not an oversight.
- Risk scoring is a transparent, weighted formula by design — explicitly *not* claimed as a trained ML model, to keep it explainable and auditable for law-enforcement use.

---

## Team / Credits

Built solo (with Claude Code as a coding agent for implementation, and a chat assistant for planning/debugging) for KSPH26.

---

*KIRA Console — because an officer's evening review should take minutes, not hours.*
