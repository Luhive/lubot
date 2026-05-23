import OpenAI from 'openai'
import { createApiClient } from '@/lib/supabase/api-client'
import { serverEnv } from '@/lib/env'

/**
 * GET /api/admin/backfill-embeddings
 *
 * One-shot endpoint: generates and saves OpenAI text-embedding-3-small embeddings
 * for every knowledge_chunks row that still has a NULL embedding.
 * Safe to call multiple times — skips rows that already have an embedding.
 */
export async function GET() {
    const apiKey = serverEnv().OPENAI_API_KEY
    if (!apiKey) {
        return Response.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey })
    const supabase = createApiClient()

    const { data: chunks, error: fetchError } = await supabase
        .from('knowledge_chunks')
        .select('id, content')
        .is('embedding', null)

    if (fetchError) {
        return Response.json({ error: fetchError.message }, { status: 500 })
    }

    if (!chunks || chunks.length === 0) {
        return Response.json({ message: 'All chunks already have embeddings', updated: 0 })
    }

    let updated = 0
    const errors: string[] = []

    for (const chunk of chunks) {
        try {
            const { data: embResponse } = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: chunk.content,
            })

            const embedding: number[] = embResponse[0].embedding

            const { error: updateError } = await supabase
                .from('knowledge_chunks')
                .update({ embedding: JSON.stringify(embedding) })
                .eq('id', chunk.id)

            if (updateError) {
                errors.push(`${chunk.id}: ${updateError.message}`)
            } else {
                updated++
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'unknown error'
            errors.push(`${chunk.id}: ${msg}`)
        }
    }

    return Response.json({
        message: `Backfilled ${updated} of ${chunks.length} chunks`,
        updated,
        total: chunks.length,
        ...(errors.length > 0 && { errors }),
    })
}
