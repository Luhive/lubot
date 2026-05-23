import type { Group } from '@/types'

export async function fetchGroups(): Promise<Group[]> {
    const res = await fetch('/api/groups')
    if (!res.ok) throw new Error('Failed to fetch groups')
    const json = await res.json()
    return json.groups as Group[]
}

export async function connectGroup(chatId: string): Promise<Group> {
    const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Failed to connect group')
    return json.group as Group
}
