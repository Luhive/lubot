import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { GroupAvatar } from './GroupAvatar'
import { ProviderLogo } from './ProviderLogo'
import type { Group } from '@/types'

interface GroupsTableProps {
    groups: Group[]
    isLoading?: boolean
    emptyVariant?: 'no-data' | 'no-results'
}

function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-6 rounded-sm" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                </TableRow>
            ))}
        </>
    )
}

function EmptyRow({ variant }: { variant: 'no-data' | 'no-results' }) {
    return (
        <TableRow>
            <TableCell colSpan={5} className="py-16 text-center">
                <p className="text-sm font-semibold">
                    {variant === 'no-results' ? 'No groups match your filters' : 'No groups connected'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    {variant === 'no-results'
                        ? 'Try adjusting your search or provider filter.'
                        : 'Connect your first group to get started.'}
                </p>
            </TableCell>
        </TableRow>
    )
}

export function GroupsTable({ groups, isLoading, emptyVariant = 'no-data' }: GroupsTableProps) {
    return (
        <div className="rounded-lg border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[36%]">Group</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Connected</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <SkeletonRows />
                    ) : groups.length === 0 ? (
                        <EmptyRow variant={emptyVariant} />
                    ) : (
                        groups.map((group) => (
                            <TableRow key={group.id}>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <GroupAvatar group={group} />
                                        <span className="font-medium text-sm">
                                            {group.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <ProviderLogo platform={group.platform} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {group.member_count?.toLocaleString() ?? '—'}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {group.connected_at
                                        ? format(new Date(group.connected_at), 'MMM d, yyyy')
                                        : '—'}
                                </TableCell>
                                <TableCell>
                                    {group.is_active ? (
                                        <Badge className="border-0 bg-green-100 text-green-700 text-xs hover:bg-green-100">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs">
                                            Inactive
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
