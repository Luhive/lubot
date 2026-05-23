"use client"

import Link from 'next/link'
import { SendIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConnectedGroups } from '@/components/dashboard/ConnectedGroups'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { RecentBroadcasts } from '@/components/dashboard/RecentBroadcasts'
import { StatCard } from '@/components/dashboard/StatCard'
import { LubotShell } from '@/components/layout/LubotShell'
import { useDashboard } from '@/lib/api/queries'

function DashboardContent() {
    const { data, isLoading, isError } = useDashboard()

    if (isLoading) {
        return <DashboardSkeleton />
    }

    if (isError || !data) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                Failed to load dashboard. Check your Supabase connection.
            </div>
        )
    }

    const { stats, chart, broadcasts, groups } = data
    const hasLiveBroadcasts = broadcasts.some((b) => b.isLive)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Overview of your connected groups, broadcasts, and agent activity.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/broadcast">
                        <SendIcon className="mr-2 h-4 w-4" />
                        New Broadcast
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total groups connected"
                    value={stats.totalGroups}
                    subtitle="Across all active providers"
                    showLiveHint
                />
                <StatCard
                    label="Total broadcasts sent"
                    value={stats.totalBroadcasts}
                    subtitle="All-time delivery count"
                    showLiveHint
                />
                <StatCard
                    label="Groups reached this week"
                    value={stats.groupsReachedThisWeek}
                    subtitle="Unique group deliveries (7 days)"
                    showLiveHint
                />
                <StatCard
                    label="Agent queries answered"
                    value={stats.agentQueriesAnswered}
                    subtitle="Knowledge base conversations"
                />
            </div>

            <ConnectedGroups groups={groups} />

            <DashboardCharts data={chart} />

            <RecentBroadcasts broadcasts={broadcasts} />

            {hasLiveBroadcasts && (
                <p className="text-xs text-muted-foreground text-center">
                    Live rows from your session are merged with demo history.
                </p>
            )}
        </div>
    )
}

export default function DashboardPage() {
    return (
        <LubotShell>
            <div className="p-6">
                <DashboardContent />
            </div>
        </LubotShell>
    )
}
