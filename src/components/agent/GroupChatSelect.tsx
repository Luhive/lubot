"use client"

import { Layers } from 'lucide-react'
import { GroupAvatar } from '@/components/groups/GroupAvatar'
import { ProviderLogo } from '@/components/groups/ProviderLogo'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { AgentChatSelection } from '@/lib/agent-group-context'
import type { Group } from '@/types'

interface GroupChatSelectProps {
    value: AgentChatSelection
    onValueChange: (value: AgentChatSelection) => void
    groups: Group[]
    isLoading?: boolean
}

function AllGroupsRow() {
    return (
        <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                <Layers className="h-3 w-3 text-muted-foreground" />
            </span>
            <span className="truncate text-sm">All groups</span>
        </div>
    )
}

function GroupRow({ group }: { group: Group }) {
    return (
        <div className="flex min-w-0 flex-1 items-center gap-2">
            <GroupAvatar group={group} className="h-5 w-5" />
            <span className="truncate text-sm">{group.name}</span>
            <ProviderLogo platform={group.platform} size={14} />
        </div>
    )
}

export function GroupChatSelect({
    value,
    onValueChange,
    groups,
    isLoading = false,
}: GroupChatSelectProps) {
    const activeGroups = groups.filter((g) => g.is_active)
    const selectedGroup =
        value === 'all' ? undefined : activeGroups.find((g) => g.id === value)

    if (isLoading) {
        return <Skeleton className="h-9 w-[220px] rounded-lg" />
    }

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="h-9 min-w-[200px] w-[220px] rounded-lg border-0 bg-muted/60 text-sm focus:ring-0">
                {value === 'all' || !selectedGroup ? (
                    <AllGroupsRow />
                ) : (
                    <GroupRow group={selectedGroup} />
                )}
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all" textValue="All groups">
                    <AllGroupsRow />
                </SelectItem>
                {activeGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id} textValue={group.name}>
                        <GroupRow group={group} />
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
