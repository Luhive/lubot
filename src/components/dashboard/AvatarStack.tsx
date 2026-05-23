import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { BroadcastReplier } from '@/lib/dashboard/merge-stats'
import { cn } from '@/lib/utils'

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
}

interface AvatarStackProps {
    repliers: BroadcastReplier[]
    overflowCount?: number
    className?: string
}

export function AvatarStack({
    repliers,
    overflowCount = 0,
    className,
}: AvatarStackProps) {
    if (repliers.length === 0 && overflowCount === 0) {
        return null
    }

    return (
        <div className={cn('flex flex-col items-end gap-1.5', className)}>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Replied
            </span>
            <div className="flex items-center">
                <div className="flex -space-x-2">
                    {repliers.map((person) => (
                        <Avatar
                            key={person.name}
                            className="h-8 w-8 border-2 border-background"
                        >
                            <AvatarImage src={person.avatarUrl} alt={person.name} />
                            <AvatarFallback className="text-[10px] font-medium">
                                {getInitials(person.name)}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                </div>
                {overflowCount > 0 && (
                    <span className="ml-2 text-xs font-medium text-muted-foreground tabular-nums">
                        +{overflowCount} more
                    </span>
                )}
            </div>
        </div>
    )
}
