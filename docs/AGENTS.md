# Lubot — Knowledge Base (Agent Guide)

Hackathon build docs live in [`docs/raw/`](raw/). This file tells agents **how to read them without wasting tokens** and **how to keep them in sync** when the project changes.

Aligns with [docs/README.md](README.md): the knowledge base should auto-update at each change.

---

## Read order

1. Skim **this file**.
2. Follow [AGENTS.md](../AGENTS.md) at the repo root for stack, auth, migrations, and env (`src/lib/env.ts`).
3. Open [execution-order.md](raw/execution-order.md) — find the current phase and the next unchecked step.
4. Pull detail from [master.md](raw/master.md) **only for the section number** referenced by that step (see [Token discipline](#token-discipline--do-not-scan-mastermd)).
5. Use [schema.md](raw/schema.md) for SQL. When implementing, prefer `supabase/migrations/` + `npm run gen:types` per root AGENTS.md (do not rely on paste-only SQL long term).

---

## Raw files

| File | Role | How to read |
|------|------|-------------|
| [execution-order.md](raw/execution-order.md) | Phased checklist — **what to do next** | Whole file OK (~200 lines) |
| [master.md](raw/master.md) | Deep reference (env, APIs, UI, prompts) | **Section-by-section only** (~927 lines) |
| [schema.md](raw/schema.md) | Paste-ready SQL | Whole file or `-- TABLE:` / `-- FUNCTION:` blocks (~166 lines) |

---

## Token discipline — do not scan master.md

**Hard rules:**

- Never read [master.md](raw/master.md) end-to-end.
- Only read lines **1–27** without `offset`/`limit` (title + **Table of Contents**).
- For any other content, use `offset` + `limit` for the section range, or `Grep` for `^## N\.` first.
- Do not run broad semantic search across the entire wiki; target a **section number** or heading from the TOC or execution-order.

### Indicators at the start of each file

| File | Indicator | Use |
|------|-----------|-----|
| master.md | **Table of Contents** (lines 9–25) — 15 numbered sections | Map “Section N” from execution-order to a line range below |
| execution-order.md | **PHASE 0–7** headers + `- [ ]` checkboxes | Current work unit |
| schema.md | `-- TABLE:` / `-- FUNCTION:` comment blocks | Jump to the SQL you need |

### Section line map (master.md)

Use **start line** with `Read`; stop before the next section’s start line.

| § | Topic | Start line | End before |
|---|--------|------------|------------|
| — | TOC only | 1 | 29 |
| 1 | What we are building | 29 | 50 |
| 2 | Tech stack | 50 | 72 |
| 3 | Project file structure | 72 | 147 |
| 4 | Environment variables | 147 | 171 |
| 5 | Supabase setup | 171 | 238 |
| 6 | Telegram bot setup | 238 | 309 |
| 7 | Feature map — real vs mock | 309 | 341 |
| 8 | Pages & routes | 341 | 461 |
| 9 | API routes | 461 | 617 |
| 10 | Component breakdown | 617 | 659 |
| 11 | Data flow | 659 | 704 |
| 12 | Mock data reference | 704 | 779 |
| 13 | Agent — pre-loaded knowledge base | 779 | 840 |
| 14 | Design system | 840 | 883 |
| 15 | Cursor prompting guide | 883 | EOF |

**Example:** execution-order says “copy from MASTER.md Section 9” → read `master.md` lines **461–616** only.

If headings move, re-run `grep '^## ' docs/raw/master.md` and update this table.

### Legacy path aliases

Raw docs sometimes use old paths:

| Referenced in raw docs | Actual path |
|------------------------|-------------|
| `MASTER.md`, `docs/MASTER.md` | [docs/raw/master.md](raw/master.md) |
| `docs/schema.sql` | [docs/raw/schema.md](raw/schema.md) |

---

## Self-update when changes are made

Keeping docs current is part of **done**, not optional.

| Trigger | Update |
|---------|--------|
| Completed execution-order step | `[ ]` → `[x]` in [execution-order.md](raw/execution-order.md) |
| New/changed tables, indexes, seed data | [schema.md](raw/schema.md) + migration under `supabase/migrations/` |
| New env var | master.md §4, `src/lib/env.ts`, `.env.example` |
| New route, API, or major component | Relevant §8–10 in [master.md](raw/master.md) |
| Stack choice differs from master (e.g. TanStack Query vs SWR) | Add a dated bullet under [Implementation notes](#implementation-notes) below — do not rewrite all of master unless asked |
| Edited master.md section headings | Refresh the [section line map](#section-line-map-mastermd) in this file |

### Checklist (run before finishing a task)

- [ ] execution-order checkboxes reflect reality
- [ ] schema and migrations match the database
- [ ] master.md sections updated if behavior or contracts changed
- [ ] Section line map in this file still accurate if master headings moved

---

## Implementation notes

Repo reality may differ from the hackathon wiki. Prefer **root [AGENTS.md](../AGENTS.md)** and the codebase over blind copies from master.

| Topic | Wiki (master.md) | This repo (as of last update) |
|-------|------------------|-------------------------------|
| Framework | Next.js 14 | Next.js **15**, App Router under `src/app/` |
| Paths | Root `lib/`, `app/` | `src/lib/`, `src/app/`, `src/components/` |
| Data fetching | SWR | **TanStack Query** — `src/lib/api/` + hooks |
| Env file | `.env.local` examples | Centralized in `src/lib/env.ts`; see `.env.example` |
| Auth | Not in wiki | `AUTH_ENABLED=false` by default — see root AGENTS.md |
| Database | Paste `schema.sql` | Migration `supabase/migrations/20260523141400_lubot_initial_schema.sql` |
| Dashboard | Mock stat cards + table | **Live** `GET /api/dashboard` merges Supabase + `src/lib/mock-data.ts` |
| Analytics | Separate `/analytics` page | **Merged into `/dashboard`** (`DashboardCharts`, no `/analytics` route) |
| Settings | `/settings` page | Sidebar link exists; **page not built** |
| Lubot features | groups, broadcast, agent | **Groups, broadcast, agent, dashboard** built |

When you resolve drift (e.g. first migration, first `/groups` route), update execution-order checkboxes and add a one-line note here with the date.

**Phase 0 notes (2026-05-23):** `grammy` + `openai` installed; `textarea` + `scroll-area` shadcn components added; `TELEGRAM_BOT_TOKEN` added to `serverEnv()` and `.env.example`; initial schema migration at `supabase/migrations/20260523141400_lubot_initial_schema.sql`. User: `.env` secrets, SQL applied, BotFather token, 3 Telegram groups connected.

**Phase 1+2 notes (2026-05-23):** `src/lib/telegram.ts`, `src/lib/mock-data.ts`, `src/types/index.ts`. Sidebar: `src/components/app-sidebar.tsx` + `src/components/layout/LubotShell.tsx`. `/groups` with `GroupsTable`, `ConnectGroupDialog`, `GET`+`POST /api/groups`, `GET /api/groups/avatar`. API routes use `src/lib/supabase/api-client.ts` (service role via `@supabase/supabase-js`).

**Phase 3 notes (2026-05-23):** `/broadcast` chat composer (`BroadcastComposer`, `RecipientChips`, `GroupMentionMenu`, `AttachmentChips`, `BroadcastConfirm`). `POST /api/broadcast` + `useSendBroadcast`. Scheduled broadcasts stored only (no cron).

**Phase 4 notes (2026-05-23):** `/agent` with `ChatInterface`, streaming `POST /api/agent/chat`, `src/lib/openai.ts` (`KNOWLEDGE_BASE_PROMPTS` for demo, accessbank, amcham, neurotime). Agent knowledge doc: [raw/agent-page-knowledge-base.md](raw/agent-page-knowledge-base.md).

**Phase 5+6 notes (2026-05-23):** Unified `/dashboard` — `StatCard`, `ConnectedGroups`, `DashboardCharts` (recharts, brand primary), `RecentBroadcasts` (views/replies/engagement + `AvatarStack` replier mocks). Data: `src/lib/dashboard/merge-stats.ts`, `enrich-broadcast-engagement.ts`, `GET /api/dashboard`, `useDashboard`. `HACKATHON_DEMO_GROUPS` (3 hackathon groups) used when DB empty; real groups + avatars when connected. Phase 6 analytics folded into dashboard; `/settings` still pending.

---

## Quick reference — what Lubot is

From master.md §1 (read lines 29–49 only if you need detail):

- **Broadcast dashboard** — connect Telegram groups, send selective multi-group messages (with scheduling).
- **Onboarding agent** — AI chat grounded on community/company knowledge (pre-loaded chunks for the hackathon).

Build order and demo script: [execution-order.md](raw/execution-order.md).
