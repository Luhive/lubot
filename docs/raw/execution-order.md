# Lubot — Hackathon Execution Order

> Less than 24 hours. This is the exact order of operations.
> Check boxes as you go. Do not skip steps. Do not build out of order.

---

## PHASE 0 — Setup (30 min)

- [x] Run `npm install grammy openai @supabase/supabase-js swr date-fns`
      (grammy + openai installed 2026-05-23; @supabase/supabase-js + date-fns were pre-installed; swr skipped — repo uses TanStack Query)
- [x] Install shadcn components:
  ```bash
  npx shadcn-ui@latest add button card dialog input textarea badge tabs
  npx shadcn-ui@latest add select separator skeleton toast checkbox
  npx shadcn-ui@latest add dropdown-menu sheet scroll-area
  ```
  (All components were pre-installed; textarea + scroll-area added 2026-05-23. Uses sonner instead of legacy toast.)
- [x] Create `.env.local` with all required keys (see MASTER.md Section 4)
      (Done by user; .env.example includes TELEGRAM_BOT_TOKEN + NEXT_PUBLIC_APP_URL)
- [x] Go to Supabase → SQL Editor → paste and run `docs/schema.sql`
      (Applied via SQL Editor 2026-05-23; migration also at supabase/migrations/20260523141400_lubot_initial_schema.sql)
- [x] Verify: Supabase shows 3 tables and 22 rows in `knowledge_chunks`
      (Confirmed by user)
- [x] Go to @BotFather on Telegram → create bot → copy token into `.env.local`
      (Done by user; 3 test groups connected)

---

## PHASE 1 — Foundation (45 min)

- [x] Create `lib/supabase.ts` (copy from MASTER.md Section 5)
      (Repo uses src/lib/supabase/server.ts + client.ts + src/lib/supabase/api-client.ts — see docs/AGENTS.md)
- [x] Create `lib/telegram.ts` (copy from MASTER.md Section 6)
      (Created at src/lib/telegram.ts — uses serverEnv().TELEGRAM_BOT_TOKEN per env-variables rule)
- [x] Create `lib/openai.ts` with `KNOWLEDGE_BASE_PROMPTS` (copy from MASTER.md Section 13)
      (Created at src/lib/openai.ts — demo, accessbank, amcham, neurotime contexts)
- [x] Create `lib/mock-data.ts` (copy from MASTER.md Section 12)
      (Created at src/lib/mock-data.ts)
- [x] Create `types/index.ts` with shared types:
      (Created at src/types/index.ts — aligned with generated database.ts)
- [x] Build `app/layout.tsx` with Sidebar included
      (Sidebar provided per-page via src/components/layout/LubotShell.tsx)
- [x] Build `components/layout/Sidebar.tsx` with all nav links
      (src/components/app-sidebar.tsx updated with Lubot nav; LubotShell wraps all pages)
- [x] Build `components/shared/ComingSoonBadge.tsx`
- [x] Test: `npm run dev` — app loads with sidebar ✓

---

## PHASE 2 — Groups Page (45 min)

- [x] Build `app/api/groups/route.ts` (GET + POST — copy from MASTER.md Section 9)
      (src/app/api/groups/route.ts — uses createApiClient(); GET lists active groups, POST verifies + saves)
- [x] Build `components/groups/GroupCard.tsx`
      (Replaced by GroupsTable + GroupAvatar 2026-05-23 — card grid dropped in favour of shadcn Table)
- [x] Build `components/groups/ConnectGroupDialog.tsx`
      (3-step dialog: instructions → chatId verify → confirm)
- [x] Build `components/groups/GroupGrid.tsx`
      (Replaced by GroupsTable 2026-05-23)
- [x] Build `app/groups/page.tsx` — fetches from Supabase, shows grid + connect button
      (Table layout with Provider column + logos; name search + provider select filters; TanStack Query)
- [x] TEST: Add a real Telegram group using the bot → verify it appears in the UI ✓
      (3 groups connected and visible: Neurotime Team, Amcham Network, AccessBank Internal)

Additional work beyond original spec (2026-05-23):
- [x] GET /api/groups/avatar — server-side Telegram photo proxy (src/app/api/groups/avatar/route.ts)
- [x] GroupAvatar — avatar with initials fallback (src/components/groups/GroupAvatar.tsx)
- [x] ProviderLogo — platform logo from public/images/ (src/components/groups/ProviderLogo.tsx)
- [x] Provider column in table with Telegram/WhatsApp/Discord/Slack logos
- [x] Name + provider filters (client-side useMemo); provider select shows logos inline

---

## PHASE 3 — Broadcast Page (60 min)

- [x] Build `app/api/broadcast/route.ts` (POST — copy from MASTER.md Section 9)
      (src/app/api/broadcast/route.ts — immediate send via sendTelegramMessage + scheduled insert)
- [x] Build `components/broadcast/GroupSelector.tsx`
      (superseded 2026-05-23 — recipients via `+` / `@` in chat composer)
- [x] Build `components/broadcast/MessageComposer.tsx`
      (superseded — textarea inlined in `BroadcastComposer`)
- [x] Build `components/broadcast/SchedulePicker.tsx`
      (superseded — schedule dropdown in `BroadcastComposer` toolbar)
- [x] Build `components/broadcast/BroadcastConfirm.tsx` (shadcn Dialog)
- [x] Build `app/broadcast/page.tsx` — single centered chat composer
      (`BroadcastComposer`, `RecipientChips`, `GroupMentionMenu`, `AttachmentChips`; `+` and `@` pick groups; mock image/voice chips; TanStack + toasts)
- [ ] TEST: Select 1 group → write message → send → verify message arrives in Telegram ✓
- [ ] TEST: Schedule a broadcast → verify it appears in Supabase as 'scheduled' ✓

---

## PHASE 4 — Agent Page (45 min)

- [x] Build `app/api/agent/chat/route.ts` (streaming POST — copy from MASTER.md Section 9)
      (src/app/api/agent/chat/route.ts — gpt-4o stream via serverEnv().OPENAI_API_KEY)
- [x] Build `components/agent/ChatMessage.tsx`
      (user/assistant bubbles + typing indicator)
- [x] Build `components/agent/ChatInput.tsx`
      (textarea, Enter to send, Send button)
- [x] Build `components/agent/ChatInterface.tsx` (handles streaming)
      (context Select, fetch + ReadableStream, auto-scroll)
- [x] Build `app/agent/page.tsx` — context selector + ChatInterface
      (LubotShell wrapper at src/app/agent/page.tsx)
- [ ] TEST: Select "AccessBank" context → ask "What is the customer dispute process?" → verify grounded answer ✓
- [ ] TEST: Select "Demo" → ask "Who are the main contributors?" → verify answer ✓

---

## PHASE 5 — Dashboard (30 min)

- [x] Build `components/dashboard/StatCard.tsx`
      (src/components/dashboard/StatCard.tsx — hybrid live + mock stats)
- [x] Build `components/dashboard/RecentBroadcasts.tsx`
      (src/components/dashboard/RecentBroadcasts.tsx — border-separated history rows with engagement)
- [x] Build `app/dashboard/page.tsx` — stat cards + recent broadcasts (use mock data)
      (Unified dashboard: StatCards, ConnectedGroups, DashboardCharts, RecentBroadcasts; TanStack `useDashboard`)
- [x] Add `app/page.tsx` → redirect to `/dashboard`
      (Done in Phase 1 — src/app/page.tsx redirects to /dashboard)
- [x] `GET /api/dashboard` — Supabase aggregates merged with `MOCK_STATS` / `MOCK_ANALYTICS_CHART`
      (src/app/api/dashboard/route.ts + src/lib/dashboard/merge-stats.ts)
- [ ] TEST: Dashboard loads with correct mock stats and broadcast table ✓

Additional work beyond original spec (2026-05-23):
- [x] `DashboardCharts.tsx` — recharts area + bar charts (brand `var(--primary)`)
- [x] `DashboardSkeleton.tsx`, `src/lib/api/dashboard.ts`, `useDashboard` + invalidate on broadcast send
- [x] `enrich-broadcast-engagement.ts` — deterministic views, replies, engagement %, replier avatars (DiceBear)
- [x] `HACKATHON_DEMO_GROUPS` in mock-data (Neurotime Team, Amcham Network, AccessBank Internal)
- [x] `ConnectedGroups.tsx` + `BroadcastGroupList.tsx` — group name + avatar on dashboard and per broadcast

---

## PHASE 6 — Mock Pages (30 min)

Merged into **Phase 5** dashboard (no separate `/analytics` page):
- [x] Charts with mock + live data — `DashboardCharts` on `/dashboard` (recharts)
- [x] Broadcast history table — `RecentBroadcasts` with engagement metrics (was planned for `/analytics`)

Still pending:
- [ ] Build `app/settings/page.tsx` — platform settings UI, non-functional toggles
      (Sidebar links to `/settings` but page not built yet)
- [ ] Ensure WhatsApp and Discord tabs appear everywhere with `<ComingSoonBadge />`
      (Groups provider filter shows logos; ComingSoonBadge not swept app-wide)

---

## PHASE 7 — Polish (30 min)

- [x] Add loading skeletons to Groups and Broadcast pages
      (Groups table + GroupMentionMenu skeleton while groups load)
- [ ] Add error states (failed to load, bot not found, etc.)
      (Groups page has error state; others pending)
- [x] Add success toasts after broadcast send
      (useToast on send/schedule from broadcast page)
- [x] Make sidebar highlight the active page
      (AppSidebar uses usePathname() to set isActive on nav items)
- [ ] Mobile: ensure sidebar collapses or uses a sheet/drawer
- [ ] Quick pass: consistent spacing, no broken layouts
- [ ] TEST: Full demo flow from start to finish ✓

---

## DEMO SCRIPT (practice this)

1. Open `/dashboard` — "Here's the Lubot overview." Point out stat cards (~47+ groups, ~312+ broadcasts — mock baseline plus your live data), the three connected groups, 30-day charts, and broadcast history with views, replies, engagement, and who replied.
2. Go to `/groups` — "All connected Telegram groups in one place. Let me connect a new one." → run connect flow live
3. Go to `/broadcast` — "Now I'll select 3 groups, write a message, and send." → send live → show it arriving in Telegram → return to dashboard to show updated stats/history
4. Go to `/agent` → select "AccessBank" → ask "What is the process for onboarding a new branch employee?" → show answer
5. Mention: "WhatsApp and Discord are coming next. Settings page is on the roadmap."

Total demo time: 3–4 minutes.

---

## IF YOU HAVE EXTRA TIME — RAG Upgrade

If Phases 0–7 are done with time to spare, implement real pgvector RAG:

- [x] Add `openai` embeddings call when a question is received
      (text-embedding-3-small; embedded in retrieveChunks() inside /api/agent/chat/route.ts)
- [x] Call `match_knowledge_chunks` Supabase function with the embedding
      (match_threshold: 0.5, match_count: 5, filter_source: context — typed via database.ts)
- [x] Pass retrieved chunks to GPT as context in the system prompt
      (buildSystemPrompt() merges static KNOWLEDGE_BASE_PROMPTS with RAG passages; graceful fallback if no chunks)
- [x] This replaces the hardcoded `KNOWLEDGE_BASE_PROMPTS` approach
      (KNOWLEDGE_BASE_PROMPTS kept as fallback baseline; RAG augments it when embeddings are populated)
- [x] Backfill endpoint: GET /api/admin/backfill-embeddings — call once to populate all NULL embeddings

The `schema.sql` is already set up for this. The Supabase function `match_knowledge_chunks` already exists.

---

## THINGS THAT CAN GO WRONG + FIXES

| Problem | Fix |
|---|---|
| Bot can't send to group | Make sure bot is **admin** in the group, not just a member |
| Chat ID not working | Group IDs are negative numbers. Supergroups start with `-100`. Use `@userinfobot` |
| OpenAI streaming not working | Make sure you return `new Response(readable)` not `NextResponse.json()` |
| Supabase RLS blocking reads | RLS is disabled in schema.sql. If you re-enabled it, disable it again. |
| grammy Bot initialization fails | Check that `TELEGRAM_BOT_TOKEN` is set. Bot is initialized at import time. |
| pgvector extension missing | Run `create extension if not exists vector;` in Supabase SQL editor manually |

---

*Focus on the demo flow. Make the core happy path flawless. Everything else is secondary.*