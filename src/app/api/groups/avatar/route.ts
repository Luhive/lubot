import { NextResponse } from 'next/server'
import { fetchTelegramChatAvatar } from '@/lib/telegram'

export async function GET(req: Request) {
    const chatId = new URL(req.url).searchParams.get('chatId')
    if (!chatId) {
        return NextResponse.json({ error: 'chatId is required' }, { status: 400 })
    }

    const avatar = await fetchTelegramChatAvatar(chatId)
    if (!avatar) {
        return new NextResponse(null, { status: 404 })
    }

    return new NextResponse(avatar.data, {
        headers: {
            'Content-Type': avatar.contentType,
            'Cache-Control': 'public, max-age=86400',
        },
    })
}
