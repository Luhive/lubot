import type { Broadcast } from '@/types'

export interface SendBroadcastParams {
    groupIds: string[]
    message: string
    scheduledAt?: string
}

export interface SendBroadcastResult {
    broadcast: Broadcast
    results: { groupId: string; success: boolean; error?: string }[]
}

export async function sendBroadcast(
    params: SendBroadcastParams,
): Promise<SendBroadcastResult> {
    const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Failed to send broadcast')
    return json as SendBroadcastResult
}
