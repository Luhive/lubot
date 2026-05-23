-- Lubot — Supabase Schema
-- Paste this entire file into: Supabase Dashboard → SQL Editor → Run
-- Last updated: May 2026

-- ============================================================
-- EXTENSION: pgvector (for future RAG implementation)
-- ============================================================
create extension if not exists vector;

-- ============================================================
-- TABLE: groups
-- Stores connected Telegram (and future WhatsApp/Discord) groups
-- ============================================================
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform text not null default 'telegram',  -- 'telegram' | 'whatsapp' | 'discord'
  telegram_chat_id text unique,               -- Telegram's chat ID (negative number as string)
  member_count integer default 0,
  is_active boolean default true,
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast lookup by chat ID
create index if not exists idx_groups_telegram_chat_id on groups(telegram_chat_id);
create index if not exists idx_groups_platform on groups(platform);
create index if not exists idx_groups_is_active on groups(is_active);

-- ============================================================
-- TABLE: broadcasts
-- Stores all sent and scheduled broadcasts
-- ============================================================
create table if not exists broadcasts (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  group_ids uuid[] not null default '{}',     -- Array of group UUIDs targeted
  platform text not null default 'telegram',
  status text not null default 'sent',        -- 'sent' | 'scheduled' | 'failed' | 'partial'
  scheduled_at timestamptz,                   -- NULL if sent immediately
  sent_at timestamptz,                        -- When actually delivered (or attempted)
  recipient_count integer default 0,          -- How many groups received it
  created_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_broadcasts_status on broadcasts(status);
create index if not exists idx_broadcasts_created_at on broadcasts(created_at desc);
create index if not exists idx_broadcasts_scheduled_at on broadcasts(scheduled_at) where scheduled_at is not null;

-- ============================================================
-- TABLE: knowledge_chunks
-- Stores pre-loaded knowledge base for the onboarding agent
-- When RAG is implemented, the embedding column will be populated
-- ============================================================
create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  content text not null,                      -- The text chunk
  source text not null,                       -- 'accessbank' | 'amcham' | 'neurotime' | 'demo'
  category text,                              -- 'rules' | 'workflows' | 'faq' | 'culture' | 'products'
  metadata jsonb default '{}',               -- Flexible extra data (e.g., { date: '2025-03', author: 'Ali' })
  embedding vector(1536),                    -- NULL until RAG is implemented; 1536 = OpenAI text-embedding-3-small
  created_at timestamptz default now()
);

-- Regular index for source/category filtering
create index if not exists idx_knowledge_chunks_source on knowledge_chunks(source);
create index if not exists idx_knowledge_chunks_category on knowledge_chunks(category);

-- Vector similarity search index (for RAG when implemented)
-- Using ivfflat — good for hackathon scale, upgrade to hnsw for production
create index if not exists idx_knowledge_chunks_embedding 
  on knowledge_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ============================================================
-- FUNCTION: match_knowledge_chunks
-- Used for RAG: find the most semantically similar chunks
-- to a given query embedding
-- ============================================================
create or replace function match_knowledge_chunks (
  query_embedding vector(1536),
  match_threshold float default 0.78,
  match_count int default 10,
  filter_source text default null
)
returns table (
  id uuid,
  content text,
  source text,
  category text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    kc.id,
    kc.content,
    kc.source,
    kc.category,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  from knowledge_chunks kc
  where
    kc.embedding is not null
    and 1 - (kc.embedding <=> query_embedding) > match_threshold
    and (filter_source is null or kc.source = filter_source)
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Disabled for hackathon — no auth. Enable in production.
-- ============================================================
alter table groups disable row level security;
alter table broadcasts disable row level security;
alter table knowledge_chunks disable row level security;

-- ============================================================
-- SEED DATA: Pre-load demo knowledge chunks
-- These power the agent even without a real RAG pipeline
-- ============================================================
insert into knowledge_chunks (content, source, category) values

-- Demo community
('The community was founded in 2024 by a group of tech entrepreneurs in Baku. The main focus is technology, startups, and AI.', 'demo', 'culture'),
('Community rules: be respectful, no spam, posts must be in Azerbaijani or English. Violations result in a warning then a ban.', 'demo', 'rules'),
('The community has 340 members as of May 2026. Key contributors include Ali (AI/ML), Leyla (design), and Rauf (backend engineering).', 'demo', 'faq'),
('Monthly meetups are organized on the last Thursday of each month at different venues in Baku.', 'demo', 'workflows'),

-- AccessBank
('AccessBank serves three main customer segments: private customers, business clients, and investors. Each segment has dedicated products and service channels.', 'accessbank', 'products'),
('Cash loan eligibility: minimum 6 months of employment, minimum salary of 500 AZN, no active overdue loans. Credit scoring is done automatically through the internal CRM.', 'accessbank', 'products'),
('Customer dispute process: log the issue in CRM immediately. If not resolved within 24 hours, escalate to branch manager. If unresolved after 48 hours, forward to compliance team.', 'accessbank', 'workflows'),
('New branch employee onboarding: Day 1 — system access and HR paperwork. Days 2-3 — product training sessions. Days 4-5 — shadow a senior rep. Week 2 — work solo with supervision. Week 3 — fully independent.', 'accessbank', 'workflows'),
('Internal tools used at AccessBank: 1C for accounting, internal CRM for customer management, Telegram for team communications, internal portal for HR requests.', 'accessbank', 'faq'),
('AccessBank values: customer first, transparency in all dealings, speed of service, and continuous improvement.', 'accessbank', 'culture'),

-- AmCham
('AmCham Azerbaijan was established in 1996 and has grown to 270+ member companies representing nearly 80% of all foreign direct investment in Azerbaijan.', 'amcham', 'faq'),
('AmCham has 11 active committees: Banking & Finance, HR & Labor, Legal & Compliance, AI Working Group, Marketing & Communications, Energy, Healthcare, Real Estate, Education, Trade & Investment, and SME Development.', 'amcham', 'faq'),
('The AI Working Group was formed in 2024. It focuses on AI regulation in Azerbaijan, enterprise AI adoption, and AI talent development. Monthly meetings, open to all members.', 'amcham', 'culture'),
('To join a committee: email the AmCham Secretariat with your name, company, and which committee you are interested in and your relevant background. Most committees welcome new participants.', 'amcham', 'workflows'),
('AmCham hosts 70+ events per year including committee roundtables, networking evenings, policy forums, white paper launches, and the Annual Gala Dinner.', 'amcham', 'faq'),
('Membership tiers: Standard, Gold, and Platinum. Higher tiers receive speaking slots at events, committee leadership opportunities, and featured placement in the member directory.', 'amcham', 'faq'),

-- Neurotime
('Neurotime was founded in 2020. Core products: an AI-powered ad monitoring platform for TV and radio, Azerbaijani NLP models, OCR systems, and sentiment analysis tools.', 'neurotime', 'faq'),
('Tech stack at Neurotime: Python is the primary language. PyTorch for model training. FastAPI for API services. PostgreSQL as the main database. Redis for task queuing. Docker for deployments.', 'neurotime', 'faq'),
('The Azerbaijani NLP model uses a fine-tuned BERT architecture. BERT was chosen over GPT-based models because of lower inference cost and better performance on Azerbaijani morphology.', 'neurotime', 'faq'),
('Each client has a dedicated Telegram group, a configuration file in the repository, and receives a weekly monitoring report every Monday at 09:00 AZT.', 'neurotime', 'workflows'),
('Team norms: async-first communication, all important decisions must be pinned in the team Telegram group, code reviews are required before any merge to main, Friday demos are optional but encouraged.', 'neurotime', 'culture'),
('Current priorities as of May 2026: improving video ad detection accuracy, expanding the NLP pipeline to support Georgian language, and onboarding two new brand clients.', 'neurotime', 'faq')

on conflict do nothing;

-- ============================================================
-- VERIFY: Check everything was created correctly
-- ============================================================
select 'groups' as table_name, count(*) as row_count from groups
union all
select 'broadcasts', count(*) from broadcasts
union all
select 'knowledge_chunks', count(*) from knowledge_chunks;