import { format } from 'date-fns'
import { EyeIcon, MessageCircleIcon } from 'lucide-react'
import { AvatarStack } from '@/components/dashboard/AvatarStack'
import { BroadcastGroupList } from '@/components/dashboard/BroadcastGroupList'
import { BroadcastMetric } from '@/components/dashboard/BroadcastMetric'
import { EngagementBar } from '@/components/dashboard/EngagementBar'
import { ProviderLogo } from '@/components/groups/ProviderLogo'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardBroadcastRow } from '@/lib/dashboard/merge-stats'
import type { BroadcastStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_VARIANT: Record<
    BroadcastStatus,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    sent: 'default',
    scheduled: 'secondary',
    failed: 'destructive',
    partial: 'outline',
}

interface RecentBroadcastsProps {
    broadcasts: DashboardBroadcastRow[]
}

function BroadcastHistoryRow({ row }: { row: DashboardBroadcastRow }) {
    const hasMetrics = row.views !== null
    const overflowCount =
        row.replies !== null && row.replies > row.repliers.length
            ? row.replies - row.repliers.length
            : 0

    return (
        <article
            className={cn(
                'border-b border-border py-6 last:border-b-0',
                row.isLive && 'bg-primary/[0.02]',
            )}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ProviderLogo platform={row.platform} />
                    <time dateTime={row.sentAt}>
                        {format(new Date(row.sentAt), 'MMM d, yyyy HH:mm')}
                    </time>
                    {row.isLive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-green-600 dark:text-green-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Live
                        </span>
                    )}
                </div>
                <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
            </div>

            <p className="mt-3 line-clamp-2 text-sm leading-relaxed">{row.message}</p>

            <BroadcastGroupList groups={row.groups} className="mt-3" />

            {hasMetrics ? (
                <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-wrap items-end gap-x-2 gap-y-4">
                        <BroadcastMetric
                            icon={EyeIcon}
                            label="Views"
                            value={row.views}
                        />
                        <BroadcastMetric
                            icon={MessageCircleIcon}
                            label="Replies"
                            value={row.replies}
                        />
                        <EngagementBar rate={row.engagementRate} />
                    </div>
                    <AvatarStack
                        repliers={row.repliers}
                        overflowCount={overflowCount}
                    />
                </div>
            ) : (
                <p className="mt-4 text-xs text-muted-foreground">
                    Metrics available after send
                </p>
            )}
        </article>
    )
}

export function RecentBroadcasts({ broadcasts }: RecentBroadcastsProps) {
    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-base">Broadcast history</CardTitle>
            </CardHeader>
            <div className="border-t px-4 pb-2 sm:px-6">
                {broadcasts.map((row) => (
                    <BroadcastHistoryRow key={row.id} row={row} />
                ))}
            </div>
        </Card>
    )
}
