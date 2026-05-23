import { bot } from '@/lib/telegram'
import { createApiClient } from '@/lib/supabase/api-client'
import {
    captureTelegramMessage,
    chatIdLookupVariants,
} from '@/lib/telegram-message-capture'

const HANDLERS_KEY = Symbol.for('lubot.telegram.webhookHandlersRegistered')

function handlersAlreadyRegistered(): boolean {
    const g = globalThis as typeof globalThis & { [key: symbol]: boolean | undefined }
    return Boolean(g[HANDLERS_KEY])
}

function markHandlersRegistered(): void {
    const g = globalThis as typeof globalThis & { [key: symbol]: boolean | undefined }
    g[HANDLERS_KEY] = true
}

export function registerTelegramWebhookHandlers(): void {
    if (handlersAlreadyRegistered()) return
    markHandlersRegistered()

    bot.on('message:text', async (ctx) => {
        const chat = ctx.chat
        if (chat.type !== 'group' && chat.type !== 'supergroup') {
            console.info('[telegram] skipped: not a group chat', { type: chat.type })
            return
        }

        const from = ctx.from
        if (!from || from.is_bot) return

        const text = ctx.message.text.trim()
        if (text.startsWith('/') || text.length < 3) {
            console.info('[telegram] skipped: too short or command', {
                chatId: chat.id,
                length: text.length,
            })
            return
        }

        const chatId = String(chat.id)
        const variants = chatIdLookupVariants(chatId)
        const supabase = createApiClient()

        const { data: group, error } = await supabase
            .from('groups')
            .select('id, name')
            .in('telegram_chat_id', variants)
            .eq('is_active', true)
            .maybeSingle()

        if (error) {
            console.error('[telegram] group lookup failed', error.message)
            return
        }
        if (!group) {
            console.warn('[telegram] skipped: group not found', { chatId, variants })
            return
        }

        const senderName =
            [from.first_name, from.last_name].filter(Boolean).join(' ') ||
            from.username ||
            'Unknown'

        const result = await captureTelegramMessage(
            {
                chatId,
                text,
                senderName,
                messageId: ctx.message.message_id,
            },
            group.name,
        )

        if (!result.ok) {
            console.error('[telegram] capture failed', result.error)
            return
        }

        console.info('[telegram] captured', {
            chunkId: result.chunkId,
            chatId,
            group: group.name,
        })
    })
}
