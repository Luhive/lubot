import { bot } from '@/lib/telegram'
import { createApiClient } from '@/lib/supabase/api-client'
import { env } from '@/lib/env'

/**
 * GET /api/telegram/status
 *
 * Webhook health check + setup hints for live message capture.
 */
export async function GET() {
    const supabase = createApiClient()

    const [{ count, error: countError }, webhookInfo] = await Promise.all([
        supabase
            .from('groups')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true),
        bot.api.getWebhookInfo(),
    ])

    const appUrl = env().APP_URL.replace(/\/$/, '')
    const expectedWebhook = appUrl
        ? `${appUrl}/api/telegram/webhook`
        : null

    return Response.json({
        connectedGroupsCount: countError ? null : (count ?? 0),
        webhookInfo,
        expectedWebhook,
        webhookMatches:
            expectedWebhook != null && webhookInfo.url === expectedWebhook,
        privacyModeNote:
            'In @BotFather: Bot Settings → Group Privacy → Turn off. Otherwise the bot only receives commands and @mentions, not normal group messages.',
        captureRules: {
            minMessageLength: 3,
            skipsCommands: true,
            skipsBotMessages: true,
            knowledgeCategory: 'live',
        },
    })
}
