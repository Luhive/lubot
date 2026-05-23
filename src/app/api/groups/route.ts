import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { chatIdLookupVariants } from '@/lib/telegram-message-capture'
import { getTelegramChatInfo } from '@/lib/telegram'

export async function GET() {
    const supabase = createApiClient()
    const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_active', true)
        .order('connected_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ groups: data })
}

export async function POST(req: Request) {
    const { chatId } = await req.json()

    if (!chatId) {
        return NextResponse.json({ error: 'chatId is required' }, { status: 400 })
    }

    const info = await getTelegramChatInfo(String(chatId))
    if ('error' in info) {
        return NextResponse.json(
            { error: 'Could not verify group. Make sure the bot is an admin.' },
            { status: 400 },
        )
    }

    const groupName =
        'title' in info.chat
            ? info.chat.title
            : 'first_name' in info.chat
              ? info.chat.first_name
              : 'Unknown'

    const supabase = createApiClient()
    const canonicalChatId = String(info.chat.id)
    const groupPayload = {
        name: groupName ?? 'Unknown',
        platform: 'telegram' as const,
        telegram_chat_id: canonicalChatId,
        member_count: info.memberCount,
        is_active: true as const,
    }

    const lookupIds = chatIdLookupVariants(canonicalChatId)

    const { data: existing } = await supabase
        .from('groups')
        .select('id')
        .in('telegram_chat_id', lookupIds)
        .maybeSingle()

    const { data, error } = existing?.id
        ? await supabase
              .from('groups')
              .update(groupPayload)
              .eq('id', existing.id)
              .select()
              .single()
        : await supabase
              .from('groups')
              .insert(groupPayload)
              .select()
              .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ group: data })
}
