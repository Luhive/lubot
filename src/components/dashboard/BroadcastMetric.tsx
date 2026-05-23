import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function formatCompact(value: number): string {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`
    }
    return value.toLocaleString()
}

interface BroadcastMetricProps {
    icon: LucideIcon
    label: string
    value: number | null
    className?: string
}

export function BroadcastMetric({
    icon: Icon,
    label,
    value,
    className,
}: BroadcastMetricProps) {
    return (
        <div
            className={cn(
                'flex min-w-[72px] flex-col gap-1 pr-6',
                className,
            )}
        >
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[11px] font-medium uppercase tracking-wide">
                    {label}
                </span>
            </div>
            <span className="text-lg font-semibold tabular-nums leading-none">
                {value === null ? '—' : formatCompact(value)}
            </span>
        </div>
    )
}
