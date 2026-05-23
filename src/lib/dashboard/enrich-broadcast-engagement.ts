import { MOCK_REPLIERS } from '@/lib/mock-data'
import type { BroadcastStatus, Group, Platform } from '@/types'

export interface BroadcastReplier {
    name: string
    avatarUrl: string
}

export interface DashboardBroadcastBase {
    id: string
    message: string
    groupCount: number
    status: BroadcastStatus
    sentAt: string
    platform: Platform
    isLive?: boolean
    /** When set (e.g. live broadcast), used instead of picking from the demo pool */
    resolvedGroups?: Group[]
}

export interface DashboardBroadcastRow extends DashboardBroadcastBase {
    groups: Group[]
    views: number | null
    replies: number | null
    engagementRate: number | null
    repliers: BroadcastReplier[]
}

function dicebearUrl(seed: string): string {
    return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`
}

function hashString(str: string): number {
    let h = 0
    for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i)
        h |= 0
    }
    return Math.abs(h)
}

function pickRepliers(hash: number, count: number): BroadcastReplier[] {
    const pool = MOCK_REPLIERS
    const picked: BroadcastReplier[] = []
    const used = new Set<number>()

    for (let i = 0; i < count && picked.length < pool.length; i++) {
        const idx = (hash + i * 7) % pool.length
        if (used.has(idx)) continue
        used.add(idx)
        const person = pool[idx]
        picked.push({
            name: person.name,
            avatarUrl: dicebearUrl(person.seed),
        })
    }

    return picked
}

function hasEngagementMetrics(status: BroadcastStatus): boolean {
    return status === 'sent' || status === 'partial'
}

function pickTargetGroups(
    row: DashboardBroadcastBase,
    pool: Group[],
): Group[] {
    if (row.resolvedGroups && row.resolvedGroups.length > 0) {
        return row.resolvedGroups.slice(0, 3)
    }

    if (pool.length === 0) return []

    const hash = hashString(row.id)
    const count = Math.min(Math.max(1, row.groupCount), pool.length, 3)
    const picked: Group[] = []
    const used = new Set<number>()

    for (let i = 0; i < count; i++) {
        const idx = (hash + i * 3) % pool.length
        if (used.has(idx)) continue
        used.add(idx)
        picked.push(pool[idx])
    }

    return picked
}

export function enrichBroadcastRow(
    row: DashboardBroadcastBase,
    groupPool: Group[],
): DashboardBroadcastRow {
    const groups = pickTargetGroups(row, groupPool)
    const { resolvedGroups: _, ...base } = row

    if (!hasEngagementMetrics(row.status)) {
        return {
            ...base,
            groups,
            views: null,
            replies: null,
            engagementRate: null,
            repliers: [],
        }
    }

    const hash = hashString(row.id)
    const estimatedReach = row.groupCount * (35 + (hash % 50))
    const views = Math.floor(estimatedReach * (0.55 + (hash % 25) / 100))
    const replies =
        views > 0
            ? Math.max(1, Math.floor(views * (0.02 + (hash % 6) / 100)))
            : 0
    const engagementRate =
        views > 0 ? Math.round((replies / views) * 1000) / 10 : 0

    const avatarCount = Math.min(replies, 4)
    const repliers = pickRepliers(hash, avatarCount)

    return {
        ...base,
        groups,
        views,
        replies,
        engagementRate,
        repliers,
    }
}
