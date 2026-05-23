# Lubot — Hackathon Master Wiki

> This document is the single source of truth for building Lubot during the hackathon.
> Written for use with Cursor. Every section is meant to be directly actionable.
> Last updated: May 2026

---

## Table of Contents

1. [What We Are Building](#1-what-we-are-building)
2. [Tech Stack](#2-tech-stack)
3. [Project File Structure](#3-project-file-structure)
4. [Environment Variables](#4-environment-variables)
5. [Supabase Setup](#5-supabase-setup)
6. [Telegram Bot Setup](#6-telegram-bot-setup)
7. [Feature Map — Real vs Mock](#7-feature-map--real-vs-mock)
8. [Pages & Routes](#8-pages--routes)
9. [API Routes](#9-api-routes)
10. [Component Breakdown](#10-component-breakdown)
11. [Data Flow](#11-data-flow)
12. [Mock Data Reference](#12-mock-data-reference)
13. [Agent — Pre-loaded Knowledge Base](#13-agent--pre-loaded-knowledge-base)
14. [Design System](#14-design-system)
15. [Cursor Prompting Guide](#15-cursor-prompting-guide)

---

## 1. What We Are Building

Lubot is a unified communication management tool for Telegram power users. It has two core features:

### Feature 1 — Broadcast Dashboard
A dashboard where users connect their Telegram groups and send private, selective messages to multiple groups at once — with scheduling support.

**Core value**: A community manager with 70 groups can select 25, write once, and send. Each group receives it as if it were sent directly to them only.

### Feature 2 — Onboarding Agent
An AI chat interface that answers questions about a community or company's history, culture, and workflows — sourced from real historical data (or a pre-loaded knowledge base for the hackathon).

**Core value**: A new member or employee asks "What are the rules here?" and gets an accurate, grounded answer instantly — without blocking any human.

### What is REAL vs MOCKED
See Section 7 for the full breakdown. In short:
- **Real**: group connection, group listing, broadcast send, agent chat
- **Mocked**: WhatsApp/Discord, analytics, send history, real-time ingestion, auth

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Already bootstrapped |
| UI Components | shadcn/ui | Already installed |
| Styling | Tailwind CSS | Via shadcn |
| Database | Supabase (PostgreSQL) | No auth for hackathon |
| Vector Search | pgvector (via Supabase) | Schema ready, used for agent if time allows |
| Telegram | `grammy` npm package | Lightweight, TypeScript-first |
| AI / LLM | OpenAI API (`openai` npm) | GPT-4o for agent responses |
| State Management | React hooks + SWR | No Redux |
| Icons | `lucide-react` | Already in shadcn |

### Installing dependencies

```bash
npm install grammy openai @supabase/supabase-js swr date-fns
```

---

## 3. Project File Structure

```
lubot/
├── docs/                          # This wiki lives here
│   ├── MASTER.md
│   ├── schema.sql
│   └── EXECUTION_ORDER.md
│
├── app/
│   ├── layout.tsx                 # Root layout with sidebar
│   ├── page.tsx                   # Redirect → /dashboard
│   ├── dashboard/
│   │   └── page.tsx               # Overview stats (MOCK data)
│   ├── broadcast/
│   │   └── page.tsx               # REAL — main feature
│   ├── groups/
│   │   └── page.tsx               # REAL — connect & list groups
│   ├── agent/
│   │   └── page.tsx               # REAL — chat UI
│   ├── analytics/
│   │   └── page.tsx               # MOCK — charts & history
│   ├── settings/
│   │   └── page.tsx               # MOCK — platform settings
│   └── api/
│       ├── groups/
│       │   └── route.ts           # GET all groups, POST connect
│       ├── broadcast/
│       │   └── route.ts           # POST send/schedule broadcast
│       ├── broadcasts/
│       │   └── route.ts           # GET broadcast history
│       └── agent/
│           └── chat/
│               └── route.ts       # POST chat message → AI response
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── PlatformBadge.tsx      # Telegram/WhatsApp/Discord badge
│   ├── broadcast/
│   │   ├── GroupSelector.tsx      # Multi-select group picker
│   │   ├── MessageComposer.tsx    # Textarea + char count
│   │   ├── SchedulePicker.tsx     # Date/time selector
│   │   └── BroadcastConfirm.tsx   # Confirmation dialog
│   ├── groups/
│   │   ├── GroupCard.tsx          # Card showing group name, member count
│   │   ├── GroupGrid.tsx          # Grid of GroupCards
│   │   └── ConnectGroupDialog.tsx # Dialog with bot setup instructions
│   ├── agent/
│   │   ├── ChatInterface.tsx      # Full chat UI
│   │   ├── ChatMessage.tsx        # Individual message bubble
│   │   └── ChatInput.tsx          # Input + send button
│   ├── dashboard/
│   │   ├── StatCard.tsx           # Single stat display
│   │   └── RecentBroadcasts.tsx   # Last 5 broadcasts (mock)
│   └── shared/
│       ├── ComingSoonBadge.tsx    # "Coming Soon" overlay for mocked sections
│       └── PlatformSelector.tsx   # WhatsApp/Discord tabs (disabled)
│
├── lib/
│   ├── supabase.ts                # Supabase client
│   ├── telegram.ts                # grammy bot instance + send helpers
│   ├── openai.ts                  # OpenAI client + chat helpers
│   └── mock-data.ts               # All mock data in one place
│
├── types/
│   └── index.ts                   # All shared TypeScript types
│
├── .env.local                     # See Section 4
└── next.config.js
```

---

## 4. Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> NEXT_PUBLIC_ prefix = accessible in browser. Never expose SERVICE_ROLE_KEY or BOT_TOKEN to the browser.

---

## 5. Supabase Setup

### Run this SQL in Supabase → SQL Editor

See `docs/schema.sql` for the full ready-to-paste SQL.

### Tables overview

#### `groups`
Stores connected Telegram groups.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key, auto |
| name | text | Group display name |
| platform | text | 'telegram' / 'whatsapp' / 'discord' |
| telegram_chat_id | text | Telegram's chat ID (negative number for groups) |
| member_count | integer | Approximate, from Telegram API |
| connected_at | timestamptz | When the group was connected |
| is_active | boolean | Whether the bot is still in the group |

#### `broadcasts`
Stores sent and scheduled broadcasts.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key, auto |
| message | text | The message content |
| group_ids | uuid[] | Array of group IDs targeted |
| platform | text | 'telegram' etc. |
| status | text | 'sent' / 'scheduled' / 'failed' |
| scheduled_at | timestamptz | NULL if sent immediately |
| sent_at | timestamptz | When actually delivered |
| recipient_count | integer | How many groups received it |
| created_at | timestamptz | Auto |

#### `knowledge_chunks`
Stores the pre-loaded knowledge base for the onboarding agent. If pgvector is implemented, this also stores embeddings.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key, auto |
| content | text | The text chunk |
| source | text | e.g. 'accessbank', 'amcham', 'lubot' |
| category | text | e.g. 'rules', 'workflows', 'faq' |
| embedding | vector(1536) | NULL until RAG is implemented |
| created_at | timestamptz | Auto |

### Supabase client setup (`lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side only (API routes) — has elevated privileges
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

---

## 6. Telegram Bot Setup

### Step 1 — Create your bot
1. Open Telegram, search `@BotFather`
2. Send `/newbot`
3. Choose a name: `Lubot`
4. Choose a username: `lubot_broadcast_bot` (must end in `bot`)
5. Copy the token → paste into `.env.local` as `TELEGRAM_BOT_TOKEN`

### Step 2 — Install grammy

```bash
npm install grammy
```

### Step 3 — Bot instance (`lib/telegram.ts`)

```typescript
import { Bot } from 'grammy'

const token = process.env.TELEGRAM_BOT_TOKEN

if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

export const bot = new Bot(token)

// Send a message to a specific chat ID
export async function sendTelegramMessage(chatId: string, text: string) {
  try {
    await bot.api.sendMessage(chatId, text)
    return { success: true }
  } catch (error: any) {
    console.error(`Failed to send to ${chatId}:`, error.message)
    return { success: false, error: error.message }
  }
}

// Get chat info (name, member count)
export async function getTelegramChatInfo(chatId: string) {
  try {
    const chat = await bot.api.getChat(chatId)
    const count = await bot.api.getChatMemberCount(chatId)
    return { chat, memberCount: count }
  } catch (error: any) {
    return { error: error.message }
  }
}
```

### Step 4 — How users connect a group

The user must add the bot to their Telegram group AND make it an admin (so it can send messages). The flow:

1. User opens the "Connect Group" dialog in Lubot
2. They follow the instructions:
   - Add `@lubot_broadcast_bot` to their group
   - Make it an admin
   - Get the Chat ID (use `@userinfobot` or the `/start` command in the group)
3. They paste the Chat ID into Lubot
4. Lubot calls `getTelegramChatInfo(chatId)` to verify and fetch the group name
5. Group is saved to Supabase `groups` table

### Getting a Chat ID (for demo purposes)
- Add `@userinfobot` to any group → it will reply with the group's chat ID
- Alternatively, use the Telegram Bot API: `https://api.telegram.org/bot{TOKEN}/getUpdates` after sending a message in the group

### Important: Chat IDs for groups are negative numbers
e.g. `-1001234567890` — always store as text, not integer.

---

## 7. Feature Map — Real vs Mock

### REAL (must work end-to-end)

| Feature | Where | Notes |
|---|---|---|
| Connect a Telegram group | `/groups` | User pastes Chat ID → verified via API → saved to Supabase |
| List connected groups | `/groups` | Fetched from Supabase |
| Select groups for broadcast | `/broadcast` | Multi-select from connected groups |
| Compose message | `/broadcast` | Textarea, char count |
| Send broadcast immediately | `/broadcast` | Calls Telegram API for each selected group |
| Schedule broadcast | `/broadcast` | Saves to Supabase with `scheduled_at`, UI shows scheduled status |
| Agent chat | `/agent` | Sends question to OpenAI with pre-loaded system prompt |

### MOCKED (UI exists, no real backend)

| Feature | Where | Mock approach |
|---|---|---|
| WhatsApp groups | `/groups`, `/broadcast` | Tabs exist, disabled with "Coming Soon" badge |
| Discord groups | `/groups`, `/broadcast` | Same as WhatsApp |
| Analytics dashboard | `/analytics` | Hardcoded charts with realistic fake data |
| Send history details | `/analytics` | Fake list of past broadcasts |
| Platform settings | `/settings` | Form UI that shows but doesn't save |
| Real-time chat ingestion | `/settings` → Agent tab | "Upload history" button that shows progress animation, doesn't process |
| Auth / login | — | Skip entirely. No login screen. App opens directly to dashboard. |
| Actual scheduling execution | `/broadcast` | Store in Supabase with `status: 'scheduled'`. Don't build a cron job. Show as "scheduled" in UI. |

### COMING SOON badges
All mocked platform tabs (WhatsApp, Discord) should show a subtle "Coming Soon" pill badge. Use a consistent `<ComingSoonBadge />` component. Disable clicks but keep them visible.

---

## 8. Pages & Routes

### `/` → redirect to `/dashboard`
```typescript
// app/page.tsx
import { redirect } from 'next/navigation'
export default function Home() {
  redirect('/dashboard')
}
```

---

### `/dashboard` — Overview (MOCK)
**Purpose**: First impression. Shows the product working at a glance.

**Sections**:
- Header: "Good morning, [Hardcoded name]" (no auth, just pick a name)
- Stat cards row: Total Groups Connected, Total Broadcasts Sent, Groups Reached This Week, Agent Queries Answered
- Recent Broadcasts table: last 5 entries (mock data)
- Quick action button: "New Broadcast →"

**All data is mock** — use `lib/mock-data.ts`.

---

### `/groups` — Group Management (REAL)
**Purpose**: Connect Telegram groups and see all connected groups.

**Sections**:
- Platform tabs: `Telegram` (active) | `WhatsApp` (coming soon) | `Discord` (coming soon)
- "Connect Group" button → opens dialog
- Grid of `GroupCard` components for connected groups
- Each GroupCard shows: group name, member count, platform badge, connected date, status (active/inactive)

**Connect Group Dialog flow**:
1. Show step-by-step instructions with numbered steps
2. Input field for Chat ID
3. "Verify & Connect" button
4. On success: show group name + member count preview → "Add Group" confirm
5. On error: show error message inline

**API call**: `POST /api/groups` with `{ chatId: string }`

---

### `/broadcast` — Broadcast Dashboard (REAL)
**Purpose**: The main feature. Send messages to multiple groups.

**Layout** (two-column on desktop, single column on mobile):
- Left column: Group selector
- Right column: Message composer + send controls

**Group Selector**:
- Search/filter input
- List of all connected Telegram groups with checkboxes
- Selected count badge: "5 groups selected"
- Platform filter tabs (Telegram only for now)

**Message Composer**:
- Large textarea with character count (max 4096 for Telegram)
- Optional: platform preview (shows what the message looks like in Telegram UI)

**Send Controls**:
- "Send Now" button (primary)
- "Schedule" toggle → reveals date/time picker
- Schedule button (secondary, appears when scheduling is toggled)
- Confirmation dialog before sending

**After send**:
- Success toast: "Message sent to 5 groups"
- Group selector resets
- Recent sends list updates

**API call**: `POST /api/broadcast` with `{ groupIds: string[], message: string, scheduledAt?: string }`

---

### `/agent` — Onboarding Agent (REAL)
**Purpose**: Chat with the AI about the community or company.

**Layout**:
- Full-height chat interface
- Left sidebar (or top): context selector — which knowledge base? (AccessBank / AmCham / Neurotime / Demo)
- Chat messages area
- Input at bottom

**Behavior**:
- Selecting a context loads the appropriate system prompt (pre-loaded KB)
- Each message hits `/api/agent/chat`
- Streaming responses preferred (use OpenAI stream)
- Show typing indicator while waiting

**API call**: `POST /api/agent/chat` with `{ messages: ChatMessage[], context: string }`

---

### `/analytics` — Analytics (MOCK)
**Purpose**: Show what analytics would look like.

**Sections**:
- Date range picker (non-functional, just UI)
- Chart: "Messages Sent Over Time" (line chart with 30 days of fake data)
- Chart: "Groups Reached" (bar chart)
- Table: "Broadcast History" with columns: Date, Message preview, Groups, Status, Reach
- All data from `lib/mock-data.ts`

---

### `/settings` — Settings (MOCK)
**Purpose**: Show platform management and future features.

**Sections**:
- Connected Platforms section (Telegram → connected, WhatsApp → "Connect" button with coming soon, Discord → same)
- Agent Settings section: "Upload Chat History" button (fake progress UI)
- Notification preferences (non-functional toggles)
- Account section (display only, no real user data)

---

## 9. API Routes

### `GET /api/groups`
Returns all connected groups from Supabase.

```typescript
// app/api/groups/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('is_active', true)
    .order('connected_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ groups: data })
}
```

---

### `POST /api/groups`
Verify a Telegram Chat ID and save the group.

```typescript
export async function POST(req: Request) {
  const { chatId } = await req.json()

  // 1. Verify with Telegram API
  const info = await getTelegramChatInfo(chatId)
  if (info.error) {
    return NextResponse.json({ error: 'Could not verify group. Make sure the bot is an admin.' }, { status: 400 })
  }

  // 2. Save to Supabase
  const { data, error } = await supabaseAdmin
    .from('groups')
    .upsert({
      name: info.chat.title || info.chat.first_name || 'Unknown',
      platform: 'telegram',
      telegram_chat_id: chatId.toString(),
      member_count: info.memberCount,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ group: data })
}
```

---

### `POST /api/broadcast`
Send or schedule a broadcast.

```typescript
export async function POST(req: Request) {
  const { groupIds, message, scheduledAt } = await req.json()

  // 1. Fetch group chat IDs from Supabase
  const { data: groups } = await supabaseAdmin
    .from('groups')
    .select('id, telegram_chat_id, name')
    .in('id', groupIds)

  if (!groups || groups.length === 0) {
    return NextResponse.json({ error: 'No groups found' }, { status: 400 })
  }

  // 2. If immediate send, send now
  const results = []
  if (!scheduledAt) {
    for (const group of groups) {
      const result = await sendTelegramMessage(group.telegram_chat_id, message)
      results.push({ groupId: group.id, ...result })
    }
  }

  // 3. Save to Supabase
  const status = scheduledAt ? 'scheduled' : 
    results.every(r => r.success) ? 'sent' : 'failed'

  const { data: broadcast } = await supabaseAdmin
    .from('broadcasts')
    .insert({
      message,
      group_ids: groupIds,
      platform: 'telegram',
      status,
      scheduled_at: scheduledAt || null,
      sent_at: scheduledAt ? null : new Date().toISOString(),
      recipient_count: groups.length,
    })
    .select()
    .single()

  return NextResponse.json({ broadcast, results })
}
```

---

### `GET /api/broadcasts`
Returns broadcast history from Supabase (for analytics page — can return real data if sends happened, otherwise mock data fills in).

---

### `POST /api/agent/chat`
Sends a message to OpenAI with the appropriate system prompt.

```typescript
import OpenAI from 'openai'
import { KNOWLEDGE_BASE_PROMPTS } from '@/lib/openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const { messages, context } = await req.json()

  const systemPrompt = KNOWLEDGE_BASE_PROMPTS[context] || KNOWLEDGE_BASE_PROMPTS['demo']

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: 1000,
  })

  // Stream the response
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ''
        controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

---

## 10. Component Breakdown

### `components/layout/Sidebar.tsx`
- Logo at top
- Navigation links: Dashboard, Broadcast, Groups, Agent, Analytics, Settings
- Platform status at bottom (Telegram: connected, WhatsApp/Discord: coming soon)
- Collapsible on mobile

### `components/broadcast/GroupSelector.tsx`
Props: `groups: Group[]`, `selected: string[]`, `onToggle: (id: string) => void`
- Renders a scrollable list of groups with checkboxes
- Search input to filter
- Shows selected count at top

### `components/groups/ConnectGroupDialog.tsx`
- Uses shadcn `Dialog`
- Step 1: Instructions (numbered list with clear steps)
- Step 2: Chat ID input + verify button
- Step 3 (after verify): Preview card + confirm button
- Loading states on verify

### `components/agent/ChatInterface.tsx`
- Context selector dropdown at top
- Messages rendered in scrollable container
- Auto-scroll to bottom on new messages
- User messages: right-aligned, accent color
- Agent messages: left-aligned, subtle background
- Typing indicator (animated dots) while streaming

### `components/shared/ComingSoonBadge.tsx`
```typescript
export function ComingSoonBadge() {
  return (
    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
      Coming Soon
    </span>
  )
}
```

---

## 11. Data Flow

### Broadcast Send Flow
```
User selects groups (GroupSelector)
  → User writes message (MessageComposer)
    → User clicks "Send Now"
      → Confirmation dialog
        → POST /api/broadcast { groupIds, message }
          → Fetch group chat IDs from Supabase
            → Loop: sendTelegramMessage(chatId, message) for each
              → Save broadcast record to Supabase
                → Return { broadcast, results }
                  → Show success toast
                    → Reset form
```

### Group Connect Flow
```
User opens ConnectGroupDialog
  → User adds bot to Telegram group
    → User pastes Chat ID
      → POST /api/groups { chatId }
        → getTelegramChatInfo(chatId)
          → If error: show "Bot not found or not admin"
          → If success: show preview (name, member count)
            → User confirms
              → Save to Supabase groups table
                → Refresh groups list
```

### Agent Chat Flow
```
User selects context (AccessBank / AmCham / Demo)
  → User types question
    → POST /api/agent/chat { messages, context }
      → Load systemPrompt from KNOWLEDGE_BASE_PROMPTS[context]
        → OpenAI streaming request
          → Stream chunks back to client
            → ChatInterface appends to current message
              → Scroll to bottom
```

---

## 12. Mock Data Reference

All mock data lives in `lib/mock-data.ts`. Import from here whenever you need fake data for the UI.

```typescript
// lib/mock-data.ts

export const MOCK_STATS = {
  totalGroups: 47,
  totalBroadcasts: 312,
  groupsReachedThisWeek: 89,
  agentQueriesAnswered: 1247,
}

export const MOCK_BROADCASTS = [
  {
    id: '1',
    message: 'Important update regarding our Q2 loan rates. Please check the document attached.',
    groupCount: 12,
    status: 'sent',
    sentAt: '2026-05-22T09:00:00Z',
    platform: 'telegram',
  },
  {
    id: '2',
    message: 'Reminder: The Banking & Finance committee session is tomorrow at 14:00.',
    groupCount: 8,
    status: 'sent',
    sentAt: '2026-05-21T17:30:00Z',
    platform: 'telegram',
  },
  {
    id: '3',
    message: 'New onboarding materials have been published. Please share with your teams.',
    groupCount: 23,
    status: 'scheduled',
    sentAt: '2026-05-24T09:00:00Z',
    platform: 'telegram',
  },
  {
    id: '4',
    message: 'System maintenance window this weekend: Saturday 02:00–04:00 AZT.',
    groupCount: 47,
    status: 'sent',
    sentAt: '2026-05-20T12:00:00Z',
    platform: 'telegram',
  },
  {
    id: '5',
    message: 'Welcome to all new members who joined this week!',
    groupCount: 5,
    status: 'sent',
    sentAt: '2026-05-19T10:15:00Z',
    platform: 'telegram',
  },
]

export const MOCK_GROUPS = [
  { id: 'mg1', name: 'Branch Managers — Baku', memberCount: 34, platform: 'telegram', connectedAt: '2026-04-01' },
  { id: 'mg2', name: 'Customer Service Team', memberCount: 87, platform: 'telegram', connectedAt: '2026-04-01' },
  { id: 'mg3', name: 'Marketing — East Region', memberCount: 12, platform: 'telegram', connectedAt: '2026-04-15' },
  { id: 'mg4', name: 'Banking & Finance Committee', memberCount: 41, platform: 'telegram', connectedAt: '2026-04-20' },
  { id: 'mg5', name: 'HR & Onboarding', memberCount: 19, platform: 'telegram', connectedAt: '2026-05-01' },
  { id: 'mg6', name: 'AI Working Group', memberCount: 28, platform: 'telegram', connectedAt: '2026-05-10' },
]

export const MOCK_ANALYTICS_CHART = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
  sent: Math.floor(Math.random() * 20) + 2,
  groups: Math.floor(Math.random() * 40) + 5,
}))
```

---

## 13. Agent — Pre-loaded Knowledge Base

The agent works without a real RAG pipeline by using a rich system prompt. These prompts are stored in `lib/openai.ts`.

```typescript
// lib/openai.ts

export const KNOWLEDGE_BASE_PROMPTS: Record<string, string> = {
  demo: `You are Lubot's onboarding assistant for a demo community. 
You help new members understand the community's history, rules, and culture.
Answer questions as if you have access to 2 years of community chat history.
Be helpful, specific, and concise. If you don't know something specific, say so rather than making it up.
The community is a Telegram group focused on technology and entrepreneurship in Azerbaijan.
Key facts you know:
- The community was founded in 2024 by a group of tech entrepreneurs in Baku
- Main rules: be respectful, no spam, posts must be in Azerbaijani or English
- Active projects: AI startup accelerator, monthly meetup organization
- The group has 340 members as of May 2026
- Key contributors: Ali (AI/ML), Leyla (design), Rauf (backend engineering)`,

  accessbank: `You are an internal onboarding assistant for AccessBank Azerbaijan.
You help new employees understand workflows, procedures, products, and company culture.
Answer questions as if you have indexed AccessBank's internal Telegram conversations from the last 3 years.
Be professional, accurate, and concise. Ground your answers in realistic banking procedures.
Key facts you know:
- AccessBank serves private customers, businesses, and investors across Azerbaijan
- Loan products: cash loans, business loans, mortgage. Eligibility checked via credit scoring system.
- Customer dispute process: log in CRM → escalate to branch manager if not resolved in 24h → compliance review if needed
- Onboarding checklist for new branch employees: system access (Day 1), product training (Days 2-3), shadow senior rep (Days 4-5), solo with supervision (Week 2)
- Internal tools: 1C for accounting, internal CRM for customer management, Telegram for team comms
- Values: customer first, transparency, speed of service`,

  amcham: `You are an onboarding assistant for the American Chamber of Commerce in Azerbaijan (AmCham).
You help new member companies understand AmCham's structure, history, committees, and how to get value from membership.
Answer as if you have indexed AmCham's communications and committee records from the last 5 years.
Be informative, professional, and welcoming.
Key facts you know:
- AmCham Azerbaijan was established in 1996. Has 270+ member companies as of 2026.
- 11 active committees: Banking & Finance, HR & Labor, Legal & Compliance, AI Working Group, Marketing & Communications, Energy, Healthcare, Real Estate, Education, Trade & Investment, SME Development
- Hosts 70+ events per year including roundtables, networking evenings, policy forums, and the Annual Gala
- The AI Working Group was formed in 2024 and focuses on AI regulation, adoption, and talent in Azerbaijan
- Membership tiers: Standard, Gold, Platinum. Higher tiers get speaking slots and committee leadership opportunities.
- How to join a committee: email the Secretariat with your interest and relevant background
- White papers are published annually by each committee summarizing key policy positions`,

  neurotime: `You are an internal onboarding assistant for Neurotime, a Baku-based AI company.
You help new team members (developers, data scientists, analysts) understand the tech stack, clients, and team culture.
Answer as if you have indexed Neurotime's internal team Telegram conversations since 2020.
Be technical, precise, and direct — this is an engineering team.
Key facts you know:
- Neurotime was founded in 2020. Core products: ad monitoring platform (TV/radio), Azerbaijani NLP models, OCR, sentiment analysis.
- Stack: Python (core), PyTorch for models, FastAPI for services, PostgreSQL, Redis for queuing
- The Azerbaijani NLP model uses a fine-tuned BERT architecture trained on a custom corpus — chosen over GPT-based models due to lower inference cost and better performance on Azerbaijani morphology
- Client onboarding: each client has a dedicated Telegram group, a config file in the repo, and a weekly monitoring report sent every Monday 09:00
- Team norms: async-first, decisions documented in Telegram pinned messages, code reviews required before merge, Friday demos optional but encouraged
- Current priorities (May 2026): improving ad detection accuracy for video, expanding NLP to Georgian language`,
}
```

---

## 14. Design System

### Using shadcn/ui

All UI components should be built with shadcn/ui primitives. Install components as needed:

```bash
npx shadcn-ui@latest add button card dialog input textarea badge tabs
npx shadcn-ui@latest add select separator skeleton toast checkbox
npx shadcn-ui@latest add dropdown-menu sheet scroll-area
```

### Color Palette
Use the default shadcn CSS variables but ensure the theme fits Lubot's identity:
- **Primary**: Use `hsl(var(--primary))` — set to a dark navy or deep blue in `globals.css`
- **Accent**: A teal/cyan — represents the tech/messaging angle
- **Destructive**: Standard red for errors
- **Background**: Clean white or near-white (#FAFAFA)
- **Card**: Pure white with subtle border

Suggested globals.css override for a professional dark-accented look:
```css
:root {
  --primary: 220 70% 25%;       /* Deep navy */
  --primary-foreground: 0 0% 100%;
  --accent: 185 70% 40%;        /* Teal */
  --accent-foreground: 0 0% 100%;
}
```

### Typography
- Font: `Geist` (already in Next.js) or add `DM Sans` via Google Fonts for a modern SaaS feel
- Dashboard headings: `text-2xl font-semibold tracking-tight`
- Body: `text-sm text-muted-foreground`
- Stat numbers: `text-3xl font-bold`

### Layout
- Sidebar: fixed left, 240px wide, collapses to icons on mobile
- Main content: `ml-[240px]` with `p-6` padding
- Max content width: `max-w-6xl mx-auto`

---

## 15. Cursor Prompting Guide

When using Cursor to generate code, paste the relevant section of this doc as context before prompting. Here are effective prompts for each major task:

### Building the Sidebar
```
Build a sidebar navigation component for Lubot using shadcn/ui.
It should have: Logo at top, nav links (Dashboard, Broadcast, Groups, Agent, Analytics, Settings),
and a platform status section at the bottom showing Telegram as "Connected" and WhatsApp/Discord as "Coming Soon".
Use lucide-react icons. Fixed left sidebar, 240px wide.
Reference: docs/MASTER.md Section 10 (Components) and Section 14 (Design System).
```

### Building the Broadcast Page
```
Build the /broadcast page for Lubot. Two-column layout: left side is GroupSelector (checkboxes, search),
right side is MessageComposer (textarea, char count) + send controls (Send Now button, Schedule toggle with date picker).
When Send Now is clicked, show a confirmation dialog, then POST to /api/broadcast.
Show success toast after send. Reset form after success.
Reference: docs/MASTER.md Section 8 (Broadcast page) and Section 9 (API routes).
```

### Building the Agent Page
```
Build the /agent page for Lubot. Full-height chat interface.
Context selector dropdown at top (options: Demo, AccessBank, AmCham, Neurotime).
Chat messages area with user messages right-aligned and agent messages left-aligned.
Input at bottom. POST to /api/agent/chat with { messages, context }.
Handle streaming response (ReadableStream). Show typing indicator while streaming.
Reference: docs/MASTER.md Section 8 (Agent page) and Section 9 (API routes).
```

### Building the Connect Group Dialog
```
Build ConnectGroupDialog component using shadcn Dialog.
Step-by-step instructions: 1) Add @lubot_broadcast_bot to group, 2) Make it admin, 3) Get the Chat ID.
Input field for Chat ID. "Verify & Connect" button → POST to /api/groups with { chatId }.
Show loading state. On success show group preview (name, member count). On error show inline error.
Reference: docs/MASTER.md Section 8 (Groups page) and Section 9 (API routes).
```

---

*This document is the single source of truth for Lubot hackathon development. When in doubt, refer here first.*
*Last updated: May 2026*