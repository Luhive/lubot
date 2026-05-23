import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { serverEnv } from '@/lib/env'
import type { Database } from '@/types/database'

type DBSchema = Omit<Database, '__InternalSupabase'>

/**
 * Server-side Supabase client for API route handlers.
 * Uses the service role key so it bypasses RLS (disabled anyway for the hackathon demo).
 * Do NOT import this in client components.
 */
export function createApiClient() {
    return createClient<DBSchema>(
        env().SUPABASE_URL,
        serverEnv().SERVICE_ROLE_KEY || env().SUPABASE_ANON_KEY,
    )
}
