"use client"

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupAvatar } from '@/components/groups/GroupAvatar'
import type { Group } from '@/types'

interface RecipientChipsProps {
    groups: Group[]
    onRemove: (id: string) => void
}

export function RecipientChips({ groups, onRemove }: RecipientChipsProps) {
    if (groups.length === 0) {
        return (
            <p className="text-xs text-muted-foreground px-1">
                No recipients yet. Use + or type @ to add groups.
            </p>
        )
    }

    return (
        <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
                <span
                    key={group.id}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 pl-1 pr-1 py-0.5 text-sm"
                >
                    <GroupAvatar group={group} className="h-5 w-5" />
                    <span className="max-w-[140px] truncate font-medium">{group.name}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full hover:bg-muted"
                        onClick={() => onRemove(group.id)}
                        aria-label={`Remove ${group.name}`}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </span>
            ))}
        </div>
    )
}
