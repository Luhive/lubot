"use client"

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { GroupAvatar } from '@/components/groups/GroupAvatar'
import { cn } from '@/lib/utils'
import type { Group } from '@/types'

interface GroupMentionMenuProps {
    groups: Group[]
    selectedIds: string[]
    query?: string
    onSelect: (group: Group) => void
    showSearch?: boolean
    isLoading?: boolean
    variant?: 'mention' | 'picker'
}

function GroupList({
    filtered,
    selectedIds,
    onSelect,
}: {
    filtered: Group[]
    selectedIds: string[]
    onSelect: (group: Group) => void
}) {
    if (filtered.length === 0) {
        return (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                No groups match your search.
            </p>
        )
    }

    return (
        <ul className="p-1">
            {filtered.map((group) => {
                const isSelected = selectedIds.includes(group.id)
                return (
                    <li key={group.id}>
                        <button
                            type="button"
                            disabled={isSelected}
                            onClick={() => onSelect(group)}
                            className={cn(
                                'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
                                isSelected
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:bg-accent',
                            )}
                        >
                            <GroupAvatar group={group} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{group.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {group.member_count.toLocaleString()} members
                                    {isSelected ? ' · added' : ''}
                                </p>
                            </div>
                        </button>
                    </li>
                )
            })}
        </ul>
    )
}

export function GroupMentionMenu({
    groups,
    selectedIds,
    query: externalQuery,
    onSelect,
    showSearch = false,
    isLoading,
    variant = 'picker',
}: GroupMentionMenuProps) {
    const [localQuery, setLocalQuery] = useState('')

    const filterQuery = (showSearch ? localQuery : externalQuery ?? '').trim().toLowerCase()

    const filtered = useMemo(() => {
        if (!filterQuery) return groups
        return groups.filter((g) => g.name.toLowerCase().includes(filterQuery))
    }, [groups, filterQuery])

    if (isLoading) {
        return (
            <div className="space-y-2 p-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                ))}
            </div>
        )
    }

    if (groups.length === 0) {
        return (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                No Telegram groups connected.{' '}
                <Link href="/groups" className="text-primary underline-offset-4 hover:underline">
                    Connect a group
                </Link>
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            {showSearch && (
                <Input
                    placeholder="Search groups…"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.stopPropagation()}
                />
            )}
            {variant === 'mention' ? (
                <div className="max-h-48 overflow-y-auto">
                    <GroupList
                        filtered={filtered}
                        selectedIds={selectedIds}
                        onSelect={onSelect}
                    />
                </div>
            ) : (
                <ScrollArea className="max-h-64">
                    <GroupList
                        filtered={filtered}
                        selectedIds={selectedIds}
                        onSelect={onSelect}
                    />
                </ScrollArea>
            )}
        </div>
    )
}
