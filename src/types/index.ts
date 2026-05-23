export type Platform = 'telegram' | 'whatsapp' | 'discord' | 'slack'
export type BroadcastStatus = 'sent' | 'scheduled' | 'failed' | 'partial'

export interface Group {
    id: string
    name: string
    platform: Platform
    telegram_chat_id: string | null
    member_count: number
    is_active: boolean
    connected_at: string | null
    updated_at: string | null
}

export interface Broadcast {
    id: string
    message: string
    group_ids: string[]
    platform: Platform
    status: BroadcastStatus
    scheduled_at: string | null
    sent_at: string | null
    recipient_count: number
    created_at: string | null
}

export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

export type KnowledgeContext = 'demo' | 'accessbank' | 'amcham' | 'neurotime'
