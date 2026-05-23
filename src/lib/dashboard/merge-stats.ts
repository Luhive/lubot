import {
    enrichBroadcastRow,
    type DashboardBroadcastBase,
    type DashboardBroadcastRow,
} from '@/lib/dashboard/enrich-broadcast-engagement'
import {
    MOCK_ANALYTICS_CHART,
    MOCK_BROADCASTS,
    MOCK_STATS,
} from '@/lib/mock-data'
import type { BroadcastStatus, Group, Platform } from '@/types'

export type { BroadcastReplier, DashboardBroadcastRow } from '@/lib/dashboard/enrich-broadcast-engagement'

export interface DashboardStats {
    totalGroups: number
    totalBroadcasts: number
    groupsReachedThisWeek: number
    agentQueriesAnswered: number
}

export interface RealDashboardCounts {
    activeGroups: number
    sentBroadcasts: number
    groupsReachedThisWeek: number
}

export interface ChartDataPoint {
    date: string
    sent: number
    groups: number
}

export interface RealChartDay {
    date: string
    sent: number
    recipients: number
}

export function mergeDashboardStats(real: RealDashboardCounts): DashboardStats {
    return {
        totalGroups: MOCK_STATS.totalGroups + real.activeGroups,
        totalBroadcasts: MOCK_STATS.totalBroadcasts + real.sentBroadcasts,
        groupsReachedThisWeek:
            MOCK_STATS.groupsReachedThisWeek + real.groupsReachedThisWeek,
        agentQueriesAnswered: MOCK_STATS.agentQueriesAnswered,
    }
}

export function mergeChartData(realByDay: RealChartDay[]): ChartDataPoint[] {
    const realMap = new Map(realByDay.map((d) => [d.date, d]))

    return MOCK_ANALYTICS_CHART.map((mock) => {
        const real = realMap.get(mock.date)
        return {
            date: mock.date,
            sent: mock.sent + (real?.sent ?? 0),
            groups: mock.groups + (real?.recipients ?? 0),
        }
    })
}

export function mergeBroadcastRows(
    realRows: DashboardBroadcastBase[],
    groupPool: Group[],
    limit = 10,
): DashboardBroadcastRow[] {
    const mockRows = MOCK_BROADCASTS.map((b) => ({
        id: b.id,
        message: b.message,
        groupCount: b.groupCount,
        status: b.status as BroadcastStatus,
        sentAt: b.sentAt,
        platform: b.platform as Platform,
        isLive: false,
    }))

    const liveRows = realRows.map((r) => ({ ...r, isLive: true }))

    const merged = [...liveRows, ...mockRows].sort((a, b) => {
        const timeDiff =
            new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        if (timeDiff !== 0) return timeDiff
        if (a.isLive && !b.isLive) return -1
        if (!a.isLive && b.isLive) return 1
        return 0
    })

    return merged.slice(0, limit).map((row) => enrichBroadcastRow(row, groupPool))
}
