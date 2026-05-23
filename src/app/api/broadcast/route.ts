import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { sendTelegramMessage } from '@/lib/telegram'
import type { BroadcastStatus } from '@/types'

const MAX_MESSAGE_LENGTH = 4096

interface SendResult {
    groupId: string
    success: boolean
    error?: string
}

function deriveStatus(
    scheduledAt: string | undefined,
    results: SendResult[],
): BroadcastStatus {
    if (scheduledAt) return 'scheduled'

    const successes = results.filter((r) => r.success).length
    if (successes === results.length) return 'sent'
    if (successes === 0) return 'failed'
    return 'partial'
}

export async function POST(req: Request) {
    let body: { groupIds?: string[]; message?: string; scheduledAt?: string }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { groupIds, message: rawMessage, scheduledAt } = body

    if (!Array.isArray(groupIds) || groupIds.length === 0) {
        return NextResponse.json(
            { error: 'groupIds must be a non-empty array' },
            { status: 400 },
        )
    }

    const message = typeof rawMessage === 'string' ? rawMessage.trim() : ''
    if (!message || message.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json(
            { error: `message must be 1–${MAX_MESSAGE_LENGTH} characters` },
            { status: 400 },
        )
    }

    if (scheduledAt !== undefined && scheduledAt !== null) {
        const scheduledDate = new Date(scheduledAt)
        if (Number.isNaN(scheduledDate.getTime())) {
            return NextResponse.json(
                { error: 'scheduledAt must be a valid ISO date' },
                { status: 400 },
            )
        }
        if (scheduledDate.getTime() <= Date.now()) {
            return NextResponse.json(
                { error: 'scheduledAt must be in the future' },
                { status: 400 },
            )
        }
    }

    const supabase = createApiClient()
    const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('id, telegram_chat_id, name')
        .in('id', groupIds)
        .eq('is_active', true)

    if (groupsError) {
        return NextResponse.json({ error: groupsError.message }, { status: 500 })
    }

    if (!groups || groups.length === 0) {
        return NextResponse.json({ error: 'No groups found' }, { status: 400 })
    }

    const results: SendResult[] = []

    if (!scheduledAt) {
        for (const group of groups) {
            if (!group.telegram_chat_id) {
                results.push({
                    groupId: group.id,
                    success: false,
                    error: 'Missing telegram_chat_id',
                })
                continue
            }
            const result = await sendTelegramMessage(group.telegram_chat_id, message)
            results.push({ groupId: group.id, ...result })
        }
    }

    const status = deriveStatus(scheduledAt, results)

    const { data: broadcast, error: insertError } = await supabase
        .from('broadcasts')
        .insert({
            message,
            group_ids: groupIds,
            platform: 'telegram',
            status,
            scheduled_at: scheduledAt ?? null,
            sent_at: scheduledAt ? null : new Date().toISOString(),
            recipient_count: groups.length,
        })
        .select()
        .single()

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ broadcast, results })
}
