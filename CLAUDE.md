# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**KIRA-CONSOLE** is a police intelligence dashboard (Karnataka State Police demo) with a React/TypeScript frontend and a FastAPI backend. The UI simulates an AI-driven investigation console where officers query suspects, cases, evidence, and crime networks through a conversational interface.

## Commands

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check (no emit)
npm run preview      # Preview production build
```

### Backend
```bash
cd backend
source backend/bin/activate          # Activate virtualenv (Python 3.12)
uvicorn main:app --reload --port 8000
python seed.py                       # Seed Supabase tables (run once)
```

The venv is at `backend/backend/` (nested). Fill in `backend/.env` with `CEREBRAS_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_KEY` before starting.

## Architecture

### Frontend (`src/`)

The app is a full-viewport, single-page layout split 70/30:

- **Left panel (70%)** — workspace area, swapped via `workspace` state in `App.tsx`
- **Right panel (30%)** — conversational AI chat, quick prompts, voice input, agent status list

**Workspace routing** is done client-side in `App.tsx:routeQuery()` — keyword matching on the query string routes to one of 8 workspace types (`supervision`, `suspect`, `case`, `evidence_review`, `network`, `trend`, `arrests`, `today_cases`). No router library is used.

**Investigation replay** (`runInvestigationReplay` in `App.tsx`) simulates a 6-stage multi-agent pipeline via `setTimeout` delays. Each stage updates `InvestigationProgress` state which controls what the `InvestigationWorkspace` renders. A `replayRef` boolean is used to cancel in-flight replays when the user navigates away.

**Workspaces** (`src/workspaces/`) are self-contained display components. They receive `lang`, `progress`, and event callbacks from `App.tsx`. They do not fetch data — all data is static mock data from `src/data/index.ts`.

**Drawers** (`src/components/drawers/`) are `EntityDrawer` (suspect profile) and `EvidenceDrawer` (evidence detail). At most one drawer is shown at a time; they overlay the left panel as absolutely-positioned slides.

### i18n

All UI strings go through `src/i18n/translations.ts`. The `T` object holds `{ en: string, kn: string }` pairs for every string. Use the `t(key, lang)` helper everywhere — never hardcode display strings outside `T`.

### Data

`src/data/index.ts` contains all mock data: suspects, cases, evidence items, arrests, network nodes, etc. This is the single source of truth for demo content.

### Backend (`backend/`)

FastAPI server at `POST /api/chat` streaming two SSE events per request:

1. **`workspace_signal`** (~200ms) — Cerebras Llama 3.3 70B classifies intent and returns routing JSON. The frontend uses this to switch workspaces and start the agent animation immediately.
2. **`narration`** (~1-2s) — Gemini 2.0 Flash generates the AI response text shown in chat.

Internal modules:
- `agents/router.py` — Cerebras intent classifier; returns `{workspace, action, entity, confidence, language}`
- `agents/responder.py` — Gemini response generator; receives entity data from Supabase for grounding
- `agents/translator.py` — Gemini Kannada translator + Unicode-based language detector
- `memory/supabase_memory.py` — conversation history in `sessions` + `messages` tables
- `db/entities.py` — entity lookups (suspects, cases, evidence, hotspots, arrests)
- `schemas/models.py` — Pydantic request/response models
- `seed.py` — one-time Supabase data seeder

The frontend SSE client lives at `src/services/kiraApi.js` (`sendChat`). The `App.tsx` investigation replay (`runInvestigationReplay`) is still client-side simulation — it should be wired to `sendChat` to replace the `handleAnalyze` function.

## Key Conventions

- All styling uses inline `style` objects (no Tailwind classes in workspaces/drawers), except `index.css` for base resets.
- The dark theme background is `#060A12`; panel borders use `#1E2D45`.
- `Lang = 'en' | 'kn'` flows top-down as a prop from `App` → all child components.
- Workspace components are stateless display components; all state lives in `App.tsx`.
