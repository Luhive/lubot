import { cn } from '@/lib/utils'

interface AgentSurfaceCardProps {
    className?: string
    children: React.ReactNode
}

export function AgentSurfaceCard({ className, children }: AgentSurfaceCardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl bg-card shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-border/40',
                className,
            )}
        >
            {children}
        </div>
    )
}

interface AgentCardSectionProps {
    label?: string
    className?: string
    children: React.ReactNode
}

export function AgentCardSection({ label, className, children }: AgentCardSectionProps) {
    return (
        <div className={cn('px-4 py-4', className)}>
            {label && (
                <p className="mb-3 text-xs font-medium text-muted-foreground">{label}</p>
            )}
            {children}
        </div>
    )
}
