import OpenAI from 'openai'
import { KNOWLEDGE_BASE_PROMPTS } from '@/lib/openai'
import { createApiClient } from '@/lib/supabase/api-client'
import { serverEnv } from '@/lib/env'
import type { AgentApiContext } from '@/lib/agent-group-context'
import type { ChatMessage } from '@/types'

const VALID_CONTEXTS = new Set<string>([
    'all',
    'demo',
    'accessbank',
    'amcham',
    'neurotime',
])

function isValidMessage(
    msg: unknown,
): msg is { role: 'user' | 'assistant'; content: string } {
    if (!msg || typeof msg !== 'object') return false
    const m = msg as Record<string, unknown>
    return (
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    )
}

/**
 * Retrieve the most relevant knowledge chunks for a query using pgvector RAG.
 * Returns null if the lookup fails or yields no results (caller falls back to static prompt).
 */
async function retrieveChunks(
    openai: OpenAI,
    query: string,
    source: AgentApiContext,
): Promise<string[] | null> {
    const { data: embResponse } = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
    })

    const embedding: number[] = embResponse[0].embedding

    const supabase = createApiClient()
    const { data: chunks, error } = await supabase.rpc('match_knowledge_chunks', {
        query_embedding: JSON.stringify(embedding),
        match_threshold: 0.5,
        match_count: 5,
        filter_source: source === 'all' ? null : source,
    })

    if (error || !chunks || chunks.length === 0) return null

    return chunks.map((c) => c.content)
}

/**
 * Build a system prompt that merges the static knowledge base with RAG-retrieved chunks.
 * The retrieved chunks are injected verbatim so GPT can directly cite them.
 */
function buildSystemPrompt(context: AgentApiContext, ragChunks: string[] | null): string {
    const base =
        KNOWLEDGE_BASE_PROMPTS[context] ?? KNOWLEDGE_BASE_PROMPTS.demo

    if (!ragChunks || ragChunks.length === 0) return base

    const contextBlock = ragChunks.map((c, i) => `[${i + 1}] ${c}`).join('\n\n')

    return `${base}

---
The following passages were retrieved from the community knowledge base and are directly relevant to the question. Use them to ground your answer:

${contextBlock}
---

When the retrieved passages address the question, refer to them specifically. Do not fabricate details not present in the passages or the facts listed above.`
}

export async function POST(req: Request) {
    const apiKey = serverEnv().OPENAI_API_KEY
    if (!apiKey) {
        return new Response('OPENAI_API_KEY is not configured', { status: 500 })
    }

    let body: { messages?: unknown; context?: string; groupId?: string }
    try {
        body = await req.json()
    } catch {
        return new Response('Invalid JSON body', { status: 400 })
    }

    const { messages: rawMessages, context: rawContext, groupId: _groupId } = body

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
        return new Response('messages must be a non-empty array', { status: 400 })
    }

    const messages: ChatMessage[] = rawMessages.filter(isValidMessage).map((m) => ({
        role: m.role,
        content: m.content.trim(),
    }))

    if (messages.length === 0) {
        return new Response('No valid messages provided', { status: 400 })
    }

    const context: AgentApiContext =
        typeof rawContext === 'string' && VALID_CONTEXTS.has(rawContext)
            ? (rawContext as AgentApiContext)
            : 'demo'

    const openai = new OpenAI({ apiKey })

    // Find the latest user message to embed for RAG
    const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user')

    let ragChunks: string[] | null = null
    if (latestUserMessage) {
        try {
            ragChunks = await retrieveChunks(openai, latestUserMessage.content, context)
        } catch {
            // RAG failed — degrade gracefully to static prompt
        }
    }

    const systemPrompt = buildSystemPrompt(context, ragChunks)

    try {
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o',
            stream: true,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            max_tokens: 1000,
        })

        const encoder = new TextEncoder()
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const text = chunk.choices[0]?.delta?.content ?? ''
                        if (text) {
                            controller.enqueue(encoder.encode(text))
                        }
                    }
                    controller.close()
                } catch (err) {
                    controller.error(err)
                }
            },
        })

        return new Response(readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
    } catch (err) {
        const message =
            err instanceof Error ? err.message : 'OpenAI request failed'
        return new Response(message, { status: 500 })
    }
}
