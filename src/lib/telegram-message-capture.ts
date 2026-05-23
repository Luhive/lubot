import OpenAI from 'openai'
import { createApiClient } from '@/lib/supabase/api-client'
import { serverEnv } from '@/lib/env'

/** Supergroups may use -100… while DB has legacy -… form (or vice versa). */
export function chatIdLookupVariants(chatId: string): string[] {
    const s = chatId.trim()
    const candidates = new Set<string>([s])
    if (s.startsWith('-100')) {
        candidates.add(`-${s.slice(4)}`)
    } else if (s.startsWith('-') && !s.startsWith('-100')) {
        candidates.add(`-100${s.slice(1)}`)
    }
    return [...candidates]
}

/** Maps connected group name to agent RAG context / knowledge_chunks.source */
export function deriveSource(groupName: string): string {
    const lower = groupName.toLowerCase()
    if (lower.includes('accessbank')) return 'accessbank'
    if (lower.includes('amcham')) return 'amcham'
    if (lower.includes('neurotime')) return 'neurotime'
    return 'demo'
}

export interface CaptureTelegramMessageInput {
    chatId: string
    text: string
    senderName: string
    messageId: number
}

/**
 * Stores a live group message in knowledge_chunks and embeds it for RAG.
 * Only call for chats that exist in the groups table (caller should verify).
 */
export async function captureTelegramMessage(
    input: CaptureTelegramMessageInput,
    groupName: string,
): Promise<{ ok: boolean; chunkId?: string; error?: string }> {
    const supabase = createApiClient()
    const source = deriveSource(groupName)

    const { data: inserted, error: insertError } = await supabase
        .from('knowledge_chunks')
        .insert({
            content: input.text,
            source,
            category: 'live',
            metadata: {
                sender: input.senderName,
                telegram_chat_id: input.chatId,
                telegram_message_id: input.messageId,
                captured_at: new Date().toISOString(),
                group_name: groupName,
            },
        })
        .select('id')
        .single()

    if (insertError || !inserted) {
        return { ok: false, error: insertError?.message ?? 'Insert failed' }
    }

    const apiKey = serverEnv().OPENAI_API_KEY
    if (!apiKey) {
        return { ok: true, chunkId: inserted.id }
    }

    try {
        const openai = new OpenAI({ apiKey })
        const { data: embResponse } = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: input.text,
        })
        const embedding: number[] = embResponse[0].embedding

        const { error: updateError } = await supabase
            .from('knowledge_chunks')
            .update({ embedding: JSON.stringify(embedding) })
            .eq('id', inserted.id)

        if (updateError) {
            console.error('Failed to save embedding for chunk', inserted.id, updateError.message)
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Embedding failed'
        console.error('OpenAI embedding error:', msg)
    }

    return { ok: true, chunkId: inserted.id }
}
