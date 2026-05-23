import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface EngagementBarProps {
    rate: number | null
    className?: string
}

export function EngagementBar({ rate, className }: EngagementBarProps) {
    if (rate === null) {
        return (
            <div className={cn('flex flex-col gap-1.5', className)}>
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Engagement
                </span>
                <span className="text-lg font-semibold leading-none">—</span>
            </div>
        )
    }

    const clamped = Math.min(rate, 100)

    return (
        <div
            className={cn(
                'flex min-w-[140px] flex-1 flex-col gap-2',
                className,
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Engagement
                </span>
                <span className="text-sm font-semibold tabular-nums">{rate}%</span>
            </div>
            <Progress value={clamped} className="h-1.5" />
        </div>
    )
}
