import { GroupAvatar } from '@/components/groups/GroupAvatar'
import type { Group } from '@/types'
import { cn } from '@/lib/utils'

interface BroadcastGroupListProps {
    groups: Group[]
    className?: string
}

export function BroadcastGroupList({ groups, className }: BroadcastGroupListProps) {
    if (groups.length === 0) return null

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {groups.map((group) => (
                <div
                    key={group.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-0.5 pl-0.5 pr-2.5"
                >
                    <GroupAvatar group={group} className="h-6 w-6" />
                    <span className="text-xs font-medium leading-none">{group.name}</span>
                </div>
            ))}
        </div>
    )
}
