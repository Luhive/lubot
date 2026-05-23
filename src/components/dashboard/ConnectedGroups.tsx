import { GroupAvatar } from '@/components/groups/GroupAvatar'
import { ProviderLogo } from '@/components/groups/ProviderLogo'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import type { Group } from '@/types'

interface ConnectedGroupsProps {
    groups: Group[]
}

export function ConnectedGroups({ groups }: ConnectedGroupsProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Connected groups</CardTitle>
            </CardHeader>
            <div className="grid gap-3 border-t px-4 pb-4 pt-3 sm:grid-cols-3 sm:px-6">
                {groups.map((group) => (
                    <div
                        key={group.id}
                        className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
                    >
                        <GroupAvatar group={group} className="h-9 w-9" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{group.name}</p>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ProviderLogo platform={group.platform} size={14} />
                                <span className="tabular-nums">
                                    {group.member_count} members
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}
