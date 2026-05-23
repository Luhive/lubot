"use client"

import { GroupAvatar } from '@/components/groups/GroupAvatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Group } from '@/types'

interface SuggestedGroupChipsProps {
    groups: Group[]
    selectedIds: string[]
    onSelect: (group: Group) => void
    isLoading?: boolean
}

/** Short label for chip, e.g. "Amcham Network" → "Amcham" */
function chipLabel(name: string) {
    return name.split(/\s+/)[0] ?? name
}

export function SuggestedGroupChips({
    groups,
    selectedIds,
    onSelect,
    isLoading,
}: SuggestedGroupChipsProps) {
    if (isLoading) {
        return (
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-28 rounded-full" />
                ))}
            </div>
        )
    }

    if (groups.length === 0) return null

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">Suggested</span>
            {groups.map((group) => {
                const isSelected = selectedIds.includes(group.id)
                return (
                    <button
                        key={group.id}
                        type="button"
                        disabled={isSelected}
                        onClick={() => onSelect(group)}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2.5 text-xs font-medium transition-colors',
                            isSelected
                                ? 'cursor-not-allowed border-muted bg-muted/50 text-muted-foreground'
                                : 'border-border bg-background hover:bg-accent hover:text-accent-foreground',
                        )}
                    >
                        <GroupAvatar group={group} className="h-6 w-6" />
                        {chipLabel(group.name)}
                    </button>
                )
            })}
        </div>
    )
}
