import { webhookCallback } from 'grammy'
import { bot } from '@/lib/telegram'
import { registerTelegramWebhookHandlers } from '@/lib/telegram-webhook-handlers'

registerTelegramWebhookHandlers()

export const POST = webhookCallback(bot, 'std/http')
