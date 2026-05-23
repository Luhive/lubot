"use client"

import { COMMUNITY_INSIGHTS } from '@/lib/mock-insights'
import { cn } from '@/lib/utils'
import { AgentSurfaceCard } from '@/components/agent/AgentSurfaceCard'
import type { KnowledgeContext } from '@/types'

interface CompactInsightsBarProps {
    context: KnowledgeContext
}

function MiniHealthRing({ score }: { score: number }) {
    const size = 36
    const strokeWidth = 4
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - score / 100)

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-sky-100 dark:text-sky-950"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#86efac"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
                {score}
            </span>
        </div>
    )
}

function TrendPill({ value }: { value: string }) {
    return (
        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            {value}
        </span>
    )
}

function MetricBlock({
    label,
    value,
    trend,
    suffix,
}: {
    label: string
    value: string | number
    trend: string
    suffix?: string
}) {
    return (
        <div className="flex min-w-[88px] flex-col">
            <p className="text-[10px] leading-snug text-muted-foreground">{label}</p>
            <div className="mt-1.5 flex items-center gap-2">
                <span className="text-sm font-bold tabular-nums leading-none">
                    {value}
                    {suffix}
                </span>
                <TrendPill value={trend} />
            </div>
        </div>
    )
}

export function CompactInsightsBar({ context }: CompactInsightsBarProps) {
    const insights = COMMUNITY_INSIGHTS[context]
    const hotInterests = insights.interests.filter((i) => i.hot).slice(0, 2)
    const normalInterests = insights.interests.filter((i) => !i.hot).slice(0, 2)
    const displayInterests = [...hotInterests, ...normalInterests]

    return (
        <AgentSurfaceCard className="shrink-0 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                {/* Health score */}
                <div className="flex shrink-0 items-center gap-3">
                    <MiniHealthRing score={insights.healthScore} />
                    <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-semibold tabular-nums leading-tight">
                            {insights.healthScore}/100
                        </p>
                        <p className="text-[10px] leading-snug text-muted-foreground">
                            {insights.healthLabel}
                        </p>
                    </div>
                </div>

                {/* Metrics */}
                <div className="flex shrink-0 items-center gap-6 sm:gap-8 sm:border-l sm:border-border/50 sm:pl-6 md:pl-8">
                    <MetricBlock
                        label="Response rate"
                        value={insights.engagementRate}
                        suffix="%"
                        trend={insights.engagementTrend}
                    />
                    <MetricBlock
                        label="Avg msgs/day"
                        value={insights.avgMessagesPerDay}
                        trend={insights.avgMessagesTrend}
                    />
                </div>

                {/* Top interests */}
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:max-w-[280px] sm:justify-end sm:border-l sm:border-border/50 sm:pl-6 md:pl-8 lg:max-w-none">
                    {displayInterests.map((interest) => (
                        <span
                            key={interest.label}
                            className={cn(
                                'rounded-full border px-2.5 py-1 text-[10px] font-medium leading-none',
                                interest.hot
                                    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                    : 'border-border/60 bg-muted/50 text-muted-foreground',
                            )}
                        >
                            {interest.label}
                        </span>
                    ))}
                </div>
            </div>
        </AgentSurfaceCard>
    )
}
