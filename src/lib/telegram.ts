import { Bot } from 'grammy'
import { serverEnv } from '@/lib/env'

const token = serverEnv().TELEGRAM_BOT_TOKEN

if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

export const bot = new Bot(token)

export async function sendTelegramMessage(
    chatId: string,
    text: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await bot.api.sendChatAction(chatId, 'typing')
        await new Promise((r) => setTimeout(r, 1500))
        await bot.api.sendMessage(chatId, text)
        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Failed to send to ${chatId}:`, message)
        return { success: false, error: message }
    }
}

export async function getTelegramChatInfo(chatId: string): Promise<
    | { chat: Awaited<ReturnType<typeof bot.api.getChat>>; memberCount: number }
    | { error: string }
> {
    try {
        const chat = await bot.api.getChat(chatId)
        const memberCount = await bot.api.getChatMemberCount(chatId)
        return { chat, memberCount }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { error: message }
    }
}

async function downloadTelegramFile(
    fileId: string,
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
    const file = await bot.api.getFile(fileId)
    if (!file.file_path) return null

    const res = await fetch(
        `https://api.telegram.org/file/bot${token}/${file.file_path}`,
    )
    if (!res.ok) return null

    return {
        data: await res.arrayBuffer(),
        contentType: res.headers.get('content-type') ?? 'image/jpeg',
    }
}

/** Fetches group/channel photo bytes (never expose bot token URL to the client). */
export async function fetchTelegramChatAvatar(
    chatId: string,
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
    try {
        const chat = await bot.api.getChat(chatId)
        const photo = chat.photo
        if (!photo) return null

        // Try small first (faster), then big — some chats only resolve one size reliably
        const fileIds = [photo.small_file_id, photo.big_file_id].filter(
            (id): id is string => Boolean(id),
        )

        for (const fileId of fileIds) {
            const downloaded = await downloadTelegramFile(fileId)
            if (downloaded) return downloaded
        }

        return null
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Failed to fetch avatar for chat ${chatId}:`, message)
        return null
    }
}
