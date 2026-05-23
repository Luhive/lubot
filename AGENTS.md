Follow the guidelines at .cursor/ folder.

# Lubot — Hackathon Agent Brief

**Stack:** Next.js 15 · Supabase · Shadcn/UI · TanStack Query · next-intl · Tailwind CSS

## Auth mode

`AUTH_ENABLED=false` (default) — all routes are public, Supabase is accessed with the anon key, no session required. Set `AUTH_ENABLED=true` in `.env` to re-enable the full login wall (middleware redirects, `/auth/*` pages) when moving toward production. Do not delete auth pages; they are preserved under `src/app/auth/`.

## Persistence workflow (add a new feature)

1. Write a SQL migration in `supabase/migrations/` — follow `.cursor/rules/create-migration.mdc`.
2. Apply it: `npx supabase db push` (local with Docker) or via the Supabase dashboard.
3. Regenerate types: `npm run gen:types` (local Docker) or `npm run gen:types:remote` (remote project, requires `npx supabase login` first). Never hand-edit `src/types/database.ts`.
4. Add an API helper in `src/lib/api/<feature>.ts` and React Query hooks alongside it.
5. Build the page/component that consumes the hooks.

## Supabase access for the demo

New tables should grant full access to `anon` and `authenticated` with no RLS while `AUTH_ENABLED=false`. Before production, add RLS and `auth.uid()` policies — see `.cursor/rules/create-rls-policies.mdc`.

## Design tokens / fonts

Not yet applied. When provided, map CSS custom properties in `src/app/globals.css` and configure the font via `next/font` in `src/app/layout.tsx`.

## Project knowledge base

For hackathon build order, wiki access rules (token-efficient reads), and doc self-update expectations, see [docs/AGENTS.md](docs/AGENTS.md).
