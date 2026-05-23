import { NextResponse } from 'next/server'
import type { DashboardBroadcastBase } from '@/lib/dashboard/enrich-broadcast-engagement'
import {
    mergeBroadcastRows,
    mergeChartData,
    mergeDashboardStats,
    type RealChartDay,
} from '@/lib/dashboard/merge-stats'
import { HACKATHON_DEMO_GROUPS } from '@/lib/mock-data'
import { createApiClient } from '@/lib/supabase/api-client'
import type { BroadcastStatus, Group, Platform } from '@/types'

function toDateKey(iso: string): string {
    return iso.slice(0, 10)
}

function mapDbGroup(row: {
    id: string
    name: string
    platform: string
    telegram_chat_id: string | null
    member_count: number | null
    is_active: boolean | null
    connected_at: string | null
    updated_at: string | null
}): Group {
    return {
        id: row.id,
        name: row.name,
        platform: row.platform as Platform,
        telegram_chat_id: row.telegram_chat_id,
        member_count: row.member_count ?? 0,
        is_active: row.is_active ?? true,
        connected_at: row.connected_at,
        updated_at: row.updated_at,
    }
}

function mapBroadcastRow(
    row: {
        id: string
        message: string
        recipient_count: number | null
        group_ids: string[] | null
        status: string
        sent_at: string | null
        scheduled_at: string | null
        platform: string
    },
    groupsById: Map<string, Group>,
): DashboardBroadcastBase {
    const sentAt = row.sent_at ?? row.scheduled_at ?? new Date().toISOString()
    const resolvedGroups = (row.group_ids ?? [])
        .map((id) => groupsById.get(id))
        .filter((g): g is Group => g !== undefined)

    return {
        id: row.id,
        message: row.message,
        groupCount: row.recipient_count ?? (resolvedGroups.length || 0),
        status: row.status as BroadcastStatus,
        sentAt,
        platform: row.platform as Platform,
        resolvedGroups: resolvedGroups.length > 0 ? resolvedGroups : undefined,
    }
}

export async function GET() {
    const supabase = createApiClient()

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoIso = weekAgo.toISOString()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoIso = thirtyDaysAgo.toISOString()

    const [
        groupsCountResult,
        activeGroupsResult,
        broadcastsResult,
        weekReachResult,
        chartBroadcastsResult,
        recentBroadcastsResult,
    ] = await Promise.all([
        supabase
            .from('groups')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true),
        supabase
            .from('groups')
            .select(
                'id, name, platform, telegram_chat_id, member_count, is_active, connected_at, updated_at',
            )
            .eq('is_active', true)
            .order('connected_at', { ascending: true }),
        supabase
            .from('broadcasts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'sent'),
        supabase
            .from('broadcasts')
            .select('recipient_count')
            .eq('status', 'sent')
            .gte('sent_at', weekAgoIso),
        supabase
            .from('broadcasts')
            .select('sent_at, recipient_count')
            .eq('status', 'sent')
            .not('sent_at', 'is', null)
            .gte('sent_at', thirtyDaysAgoIso),
        supabase
            .from('broadcasts')
            .select(
                'id, message, recipient_count, group_ids, status, sent_at, scheduled_at, platform',
            )
            .order('created_at', { ascending: false })
            .limit(10),
    ])

    if (groupsCountResult.error || broadcastsResult.error) {
        return NextResponse.json(
            { error: 'Failed to load dashboard data' },
            { status: 500 },
        )
    }

    const dbGroups = (activeGroupsResult.data ?? []).map(mapDbGroup)
    const dashboardGroups: Group[] =
        dbGroups.length > 0 ? dbGroups : [...HACKATHON_DEMO_GROUPS]
    const groupsById = new Map(dashboardGroups.map((g) => [g.id, g]))

    const groupsReachedThisWeek = (weekReachResult.data ?? []).reduce(
        (sum, row) => sum + (row.recipient_count ?? 0),
        0,
    )

    const chartByDay = new Map<string, { sent: number; recipients: number }>()
    for (const row of chartBroadcastsResult.data ?? []) {
        if (!row.sent_at) continue
        const date = toDateKey(row.sent_at)
        const existing = chartByDay.get(date) ?? { sent: 0, recipients: 0 }
        chartByDay.set(date, {
            sent: existing.sent + 1,
            recipients: existing.recipients + (row.recipient_count ?? 0),
        })
    }

    const realChartDays: RealChartDay[] = [...chartByDay.entries()].map(
        ([date, v]) => ({
            date,
            sent: v.sent,
            recipients: v.recipients,
        }),
    )

    const realBroadcastRows = (recentBroadcastsResult.data ?? []).map((row) =>
        mapBroadcastRow(row, groupsById),
    )

    const stats = mergeDashboardStats({
        activeGroups: groupsCountResult.count ?? 0,
        sentBroadcasts: broadcastsResult.count ?? 0,
        groupsReachedThisWeek,
    })

    const chart = mergeChartData(realChartDays)
    const broadcasts = mergeBroadcastRows(realBroadcastRows, dashboardGroups)

    return NextResponse.json({ stats, chart, broadcasts, groups: dashboardGroups })
}
