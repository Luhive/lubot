# Lubot — Agent Page: Enriched Design Spec

> Addendum to MASTER.md — covers the enriched /agent page layout only.
> Implement this after the base agent page is working (Phase 4 in EXECUTION_ORDER.md).
> Last updated: May 2026

---

## Layout Overview

The `/agent` page is a **three-column layout**:

```
[ App Sidebar ] [ Community Insights Panel ] [ Chat Area ]
    200px                 240px                  flex: 1
```

The Community Insights Panel is new — it sits between the app sidebar and the chat area, and shows live (mocked) analytics about the connected community.

```tsx
// app/agent/page.tsx — top-level layout
<div className="flex h-[calc(100vh-0px)] overflow-hidden">
  <CommunityInsights context={context} />   {/* 240px fixed */}
  <ChatArea context={context} onContextChange={setContext} />  {/* fills rest */}
</div>
```

---

## Component 1 — `CommunityInsights`

**File**: `components/agent/CommunityInsights.tsx`

**Props**:
```typescript
interface CommunityInsightsProps {
  context: AgentContext  // 'demo' | 'accessbank' | 'amcham' | 'neurotime'
}
```

**Layout**: Fixed 240px wide left panel, full height, scrollable, with a border-right. Divided into sections separated by border-bottom lines.

### Sections (top to bottom):

#### 1. Panel header
```
"Community insights"  ← 11px uppercase muted label
```

#### 2. Health Score
A circular ring gauge showing the community activity health score.

```tsx
<HealthScoreRing score={insights.healthScore} trend={insights.healthTrend} />
```

Ring is an SVG circle with:
- Gray background track
- Green (#22c55e) fill arc, calculated as `strokeDashoffset = circumference * (1 - score/100)`
- Score number centered inside
- Below the ring: score label (e.g. "82/100"), subtitle ("Active community"), trend line ("↑ +4 this week" in green)

#### 3. Engagement Stats
Two stat boxes side by side:
- Left: Response rate (e.g. "68%") with trend arrow
- Right: Avg messages/day (e.g. "4.2") with trend arrow

Both boxes use `bg-muted rounded-md p-2`.

#### 4. Top Interests
Tag chips from the `insights.interests` array. Tags marked `hot: true` get an amber background (`bg-amber-100 text-amber-800 border-amber-300`). Others use default muted style.

```tsx
{insights.interests.map(interest => (
  <span key={interest.label} className={interest.hot ? 'tag-hot' : 'tag'}>
    {interest.label}
  </span>
))}
```

#### 5. Active Hours
A mini horizontal bar chart showing relative activity per weekday (Mon–Fri). Each row: day label (10px) + track bar + percentage.

```tsx
{insights.activeHours.map(({ day, pct }) => (
  <div key={day} className="flex items-center gap-2">
    <span className="w-8 text-[10px] text-muted-foreground">{day}</span>
    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
    </div>
    <span className="text-[10px] text-muted-foreground w-6 text-right">{pct}%</span>
  </div>
))}
```

#### 6. Recent Conversations
Last 3 conversations between community members. Each item:
- Initials avatar (colored circle, 24px)
- Names: "Ali → Leyla"
- Message preview (truncated, max 1 line)
- Relative timestamp ("2m", "18m", "1h")

```tsx
{insights.recentConversations.map(convo => (
  <div key={convo.id} className="flex items-start gap-2">
    <Avatar initials={convo.initials} color={convo.color} size={24} />
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium">{convo.from} → {convo.to}</p>
      <p className="text-[10px] text-muted-foreground truncate">{convo.preview}</p>
    </div>
    <span className="text-[10px] text-muted-foreground flex-shrink-0">{convo.time}</span>
  </div>
))}
```

---

## Component 2 — `ChatArea`

**File**: `components/agent/ChatArea.tsx`

**Props**:
```typescript
interface ChatAreaProps {
  context: AgentContext
  onContextChange: (ctx: AgentContext) => void
}
```

**Internal state**:
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([openingMessage(context)])
const [input, setInput] = useState('')
const [isStreaming, setIsStreaming] = useState(false)
```

### Sub-sections:

#### Header
```
Left: "Onboarding agent" (15px semibold) + "Ask anything about this community" (11px muted)
Right: <Select> for context switching (Demo / AccessBank / AmCham / Neurotime)
```

When context changes: reset messages to `[openingMessage(newContext)]`, clear input.

#### Messages area
Scrollable flex column. Auto-scrolls to bottom on new message.

```tsx
const messagesEndRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])
```

Agent messages: left-aligned, with a small robot icon avatar, `bg-muted` bubble, rounded `0 10px 10px 10px`.
User messages: right-aligned, dark blue (`bg-blue-700 text-white`) bubble, rounded `10px 10px 0 10px`.

Streaming: while `isStreaming` is true, show a typing indicator after the last agent message:
```tsx
<div className="flex gap-1 px-3 py-2">
  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
</div>
```

#### Suggested Questions strip
Sits between the messages area and the input. Label: "Suggested questions" (10px uppercase muted). Horizontal scrollable row of chip buttons.

Clicking a chip: sets `input` to that question text AND immediately submits it (calls `handleSend(chip)`).

```tsx
<div className="px-4 py-2 border-t">
  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Suggested questions</p>
  <div className="flex flex-wrap gap-1.5">
    {SUGGESTED_QUESTIONS[context].map(q => (
      <button
        key={q}
        onClick={() => handleSend(q)}
        className="text-[11px] px-2.5 py-1 rounded-full border border-border hover:bg-muted transition-colors"
      >
        {q}
      </button>
    ))}
  </div>
</div>
```

#### Input row
Textarea (auto-expanding, max 3 lines) + send button.

```tsx
<div className="flex gap-2 items-end px-4 pb-4 pt-2">
  <Textarea
    value={input}
    onChange={e => setInput(e.target.value)}
    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input) } }}
    placeholder="Ask a question about this community or organization…"
    className="resize-none min-h-[38px] max-h-[96px] text-sm"
    rows={1}
  />
  <Button
    size="icon"
    onClick={() => handleSend(input)}
    disabled={!input.trim() || isStreaming}
    className="h-9 w-9 shrink-0 bg-blue-700 hover:bg-blue-800"
  >
    <Send className="h-4 w-4" />
  </Button>
</div>
```

---

## Mock Data — `lib/mock-insights.ts`

Create this file. All insights panel data lives here, keyed by context.

```typescript
export type AgentContext = 'demo' | 'accessbank' | 'amcham' | 'neurotime'

export interface CommunityInsightData {
  healthScore: number
  healthTrend: string
  healthLabel: string
  engagementRate: number
  engagementTrend: string
  avgMessagesPerDay: number
  avgMessagesTrend: string
  interests: { label: string; hot: boolean }[]
  activeHours: { day: string; pct: number }[]
  recentConversations: {
    id: string
    initials: string
    avatarColor: string
    from: string
    to: string
    preview: string
    time: string
  }[]
}

export const COMMUNITY_INSIGHTS: Record<AgentContext, CommunityInsightData> = {
  demo: {
    healthScore: 82,
    healthTrend: '↑ +4 this week',
    healthLabel: 'Active community',
    engagementRate: 68,
    engagementTrend: '↑ 5%',
    avgMessagesPerDay: 4.2,
    avgMessagesTrend: '↑ 0.8',
    interests: [
      { label: 'AI / ML', hot: true },
      { label: 'Fintech', hot: true },
      { label: 'Startups', hot: false },
      { label: 'Events', hot: false },
      { label: 'Hiring', hot: false },
      { label: 'Policy', hot: false },
    ],
    activeHours: [
      { day: 'Mon', pct: 75 },
      { day: 'Tue', pct: 90 },
      { day: 'Wed', pct: 60 },
      { day: 'Thu', pct: 82 },
      { day: 'Fri', pct: 45 },
    ],
    recentConversations: [
      { id: '1', initials: 'AL', avatarColor: 'bg-blue-100 text-blue-800', from: 'Ali', to: 'Leyla', preview: 'New NLP model is ready for review', time: '2m' },
      { id: '2', initials: 'RF', avatarColor: 'bg-green-100 text-green-800', from: 'Rauf', to: 'Team', preview: 'Deployment done. API is live.', time: '18m' },
      { id: '3', initials: 'NR', avatarColor: 'bg-amber-100 text-amber-800', from: 'Nigar', to: 'Rauf', preview: 'Can we schedule the client demo?', time: '1h' },
    ],
  },

  accessbank: {
    healthScore: 91,
    healthTrend: '↑ +2 this week',
    healthLabel: 'Highly engaged',
    engagementRate: 84,
    engagementTrend: '↑ 3%',
    avgMessagesPerDay: 7.8,
    avgMessagesTrend: '↑ 1.2',
    interests: [
      { label: 'Loans', hot: true },
      { label: 'Compliance', hot: true },
      { label: 'Onboarding', hot: false },
      { label: 'CRM', hot: false },
      { label: 'Campaigns', hot: false },
      { label: 'Mobile', hot: false },
    ],
    activeHours: [
      { day: 'Mon', pct: 95 },
      { day: 'Tue', pct: 88 },
      { day: 'Wed', pct: 79 },
      { day: 'Thu', pct: 85 },
      { day: 'Fri', pct: 55 },
    ],
    recentConversations: [
      { id: '1', initials: 'SM', avatarColor: 'bg-blue-100 text-blue-800', from: 'Samira', to: 'Branch Team', preview: 'Q2 campaign materials are ready to send', time: '5m' },
      { id: '2', initials: 'EH', avatarColor: 'bg-purple-100 text-purple-800', from: 'Elvin', to: 'Compliance', preview: 'Updated KYC checklist uploaded to portal', time: '32m' },
      { id: '3', initials: 'AJ', avatarColor: 'bg-green-100 text-green-800', from: 'Aysel', to: 'HR', preview: 'New branch hire starting Monday, need access', time: '2h' },
    ],
  },

  amcham: {
    healthScore: 76,
    healthTrend: '→ stable',
    healthLabel: 'Steady activity',
    engagementRate: 59,
    engagementTrend: '↑ 1%',
    avgMessagesPerDay: 3.1,
    avgMessagesTrend: '→ 0.0',
    interests: [
      { label: 'AI Policy', hot: true },
      { label: 'IPO / Capital', hot: true },
      { label: 'HR & Labor', hot: false },
      { label: 'Events', hot: false },
      { label: 'Trade', hot: false },
      { label: 'SME', hot: false },
    ],
    activeHours: [
      { day: 'Mon', pct: 70 },
      { day: 'Tue', pct: 85 },
      { day: 'Wed', pct: 72 },
      { day: 'Thu', pct: 80 },
      { day: 'Fri', pct: 40 },
    ],
    recentConversations: [
      { id: '1', initials: 'KS', avatarColor: 'bg-blue-100 text-blue-800', from: 'Kamran', to: 'AI WG', preview: 'Draft position paper is shared in the folder', time: '10m' },
      { id: '2', initials: 'LM', avatarColor: 'bg-amber-100 text-amber-800', from: 'Lala', to: 'Secretariat', preview: 'Gala venue confirmed for November', time: '1h' },
      { id: '3', initials: 'FH', avatarColor: 'bg-green-100 text-green-800', from: 'Fidan', to: 'Members', preview: 'Reminder: Banking committee session tomorrow', time: '3h' },
    ],
  },

  neurotime: {
    healthScore: 88,
    healthTrend: '↑ +6 this week',
    healthLabel: 'Fast-moving team',
    engagementRate: 92,
    engagementTrend: '↑ 8%',
    avgMessagesPerDay: 11.4,
    avgMessagesTrend: '↑ 2.1',
    interests: [
      { label: 'NLP', hot: true },
      { label: 'Inference', hot: true },
      { label: 'Client ops', hot: false },
      { label: 'Hiring', hot: false },
      { label: 'Georgian', hot: false },
      { label: 'Ad detection', hot: false },
    ],
    activeHours: [
      { day: 'Mon', pct: 88 },
      { day: 'Tue', pct: 95 },
      { day: 'Wed', pct: 91 },
      { day: 'Thu', pct: 85 },
      { day: 'Fri', pct: 72 },
    ],
    recentConversations: [
      { id: '1', initials: 'AL', avatarColor: 'bg-blue-100 text-blue-800', from: 'Ali', to: 'Leyla', preview: 'New NLP model is ready for review', time: '2m' },
      { id: '2', initials: 'RF', avatarColor: 'bg-green-100 text-green-800', from: 'Rauf', to: 'Ali', preview: 'API latency is down to 120ms now', time: '25m' },
      { id: '3', initials: 'TM', avatarColor: 'bg-purple-100 text-purple-800', from: 'Tural', to: 'Team', preview: 'Georgian corpus scraping is 60% done', time: '1h' },
    ],
  },
}
```

---

## Suggested Questions — `lib/suggested-questions.ts`

Create this file. Questions are context-aware and change when the user switches the dropdown.

```typescript
import { AgentContext } from './mock-insights'

export const SUGGESTED_QUESTIONS: Record<AgentContext, string[]> = {
  demo: [
    'Who are the main contributors?',
    'What are the community rules?',
    "What's being worked on right now?",
    'When is the next event?',
    'How do I get involved?',
  ],
  accessbank: [
    'How do I onboard a new branch employee?',
    'What is the customer dispute process?',
    'What are the current loan products?',
    'Which internal tools do we use?',
    'What are the company values?',
  ],
  amcham: [
    'What committees can I join?',
    'What has the AI Working Group worked on?',
    'How do I attend events?',
    'What are the membership tiers?',
    'What white papers were published recently?',
  ],
  neurotime: [
    "What's our tech stack?",
    'Why did we choose BERT for Azerbaijani NLP?',
    'What are the current team priorities?',
    'How are client groups managed?',
    'What are the team norms for code review?',
  ],
}
```

---

## Opening Message — `lib/opening-messages.ts`

The agent sends this automatically when the page loads or context changes. No API call needed — it is hardcoded per context.

```typescript
import { AgentContext } from './mock-insights'
import { ChatMessage } from '@/types'

export const OPENING_MESSAGES: Record<AgentContext, string> = {
  demo: "Hi! I have access to this community's full history — rules, ongoing projects, past decisions, and who's who. Ask me anything.",
  accessbank: "Hello. I'm trained on AccessBank's internal communications. Ask me about products, procedures, onboarding workflows, or team norms.",
  amcham: "Welcome to AmCham. I can answer questions about our committees, events, 30 years of institutional history, and how membership works.",
  neurotime: "Hey. I have context on Neurotime's full team history — tech decisions, client setups, model architecture choices, and current priorities. What do you need?",
}

export function getOpeningMessage(context: AgentContext): ChatMessage {
  return {
    role: 'assistant',
    content: OPENING_MESSAGES[context],
  }
}
```

---

## Wiring It All Together — `app/agent/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { CommunityInsights } from '@/components/agent/CommunityInsights'
import { ChatArea } from '@/components/agent/ChatArea'
import { AgentContext } from '@/lib/mock-insights'

export default function AgentPage() {
  const [context, setContext] = useState<AgentContext>('demo')

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      <CommunityInsights context={context} />
      <ChatArea context={context} onContextChange={setContext} />
    </div>
  )
}
```

---

## Cursor Prompt — Build the Enriched Agent Page

Use this prompt in Cursor when building this page:

```
Build the enriched /agent page for Lubot with a three-column layout:
app sidebar (already built) + CommunityInsights panel (240px) + ChatArea (flex: 1).

Files to create:
- lib/mock-insights.ts (full COMMUNITY_INSIGHTS data keyed by AgentContext)
- lib/suggested-questions.ts (SUGGESTED_QUESTIONS keyed by AgentContext)
- lib/opening-messages.ts (getOpeningMessage helper)
- components/agent/CommunityInsights.tsx (health score ring, engagement stats, interest tags, active hours bars, recent conversations)
- components/agent/ChatArea.tsx (header with context Select, messages area, suggested question chips, textarea input)
- app/agent/page.tsx (wires context state between both components)

CommunityInsights sections: health score ring (SVG circle, green fill, score centered), two stat boxes (response rate + avg msgs/day), interest tags (amber hot style), active hours mini bar chart (Mon-Fri), recent conversations (initials avatar + name + preview + time).

ChatArea: context Select in header resets messages to opening message. Messages scrollable, auto-scroll to bottom. Agent bubbles left-aligned bg-muted, user bubbles right-aligned bg-blue-700 text-white. Streaming typing indicator (three bouncing dots). Suggested question chips above input — clicking sends immediately. Textarea input with Enter-to-send (Shift+Enter for newline). Send button disabled while streaming.

Reference: docs/AGENT_PAGE.md for all props, mock data, and component structure.
```

---

## What is MOCKED vs REAL in this doc

| Element | Status | Notes |
|---|---|---|
| Health score | Mock | From `COMMUNITY_INSIGHTS[context].healthScore` |
| Engagement rate | Mock | From mock data |
| Active hours bars | Mock | From mock data |
| Top interests | Mock | From mock data |
| Recent conversations | Mock | From mock data — looks real enough for demo |
| Suggested questions | Real UX, mock content | Chips are real buttons that submit; questions are hardcoded |
| Opening message | Real UX, hardcoded | No API call; appears instantly |
| Chat responses | Real | OpenAI streaming via `/api/agent/chat` |
| Context switching | Real | Resets messages, changes system prompt sent to API |

---

*This document is an addendum to docs/MASTER.md. Build after Phase 4 is complete.*
*Last updated: May 2026*
