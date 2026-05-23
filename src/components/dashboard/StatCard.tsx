import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

interface StatCardProps {
    label: string
    value: number
    subtitle?: string
    showLiveHint?: boolean
}

function formatNumber(n: number): string {
    return n.toLocaleString()
}

export function StatCard({ label, value, subtitle, showLiveHint }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    {showLiveHint && (
                        <span className="text-[10px] font-medium uppercase tracking-wide text-green-600 dark:text-green-400">
                            Live
                        </span>
                    )}
                </CardDescription>
                <CardTitle className="text-3xl font-semibold tabular-nums">
                    {formatNumber(value)}
                </CardTitle>
                {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
            </CardHeader>
        </Card>
    )
}
