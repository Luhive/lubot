import { bot } from '@/lib/telegram'
import { env } from '@/lib/env'

/**
 * GET /api/telegram/setup
 *
 * Registers the Telegram webhook URL (one-shot). Requires NEXT_PUBLIC_APP_URL
 * to be a publicly reachable HTTPS URL (ngrok or Vercel).
 */
export async function GET() {
    const baseUrl = env().APP_URL.replace(/\/$/, '')
    if (!baseUrl) {
        return Response.json(
            { error: 'NEXT_PUBLIC_APP_URL is not configured' },
            { status: 500 },
        )
    }

    const webhookUrl = `${baseUrl}/api/telegram/webhook`

    try {
        const ok = await bot.api.setWebhook(webhookUrl)
        const info = await bot.api.getWebhookInfo()

        return Response.json({
            ok,
            webhookUrl,
            webhookInfo: info,
        })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'setWebhook failed'
        return Response.json({ error: message }, { status: 500 })
    }
}
