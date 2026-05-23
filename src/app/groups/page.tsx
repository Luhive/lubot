"use client"

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select'
import { LubotShell } from '@/components/layout/LubotShell'
import { ConnectGroupDialog } from '@/components/groups/ConnectGroupDialog'
import { GroupsTable } from '@/components/groups/GroupsTable'
import { useGroups } from '@/lib/api/queries'
import type { Platform } from '@/types'

type ProviderOption = { value: 'all' | Platform; label: string; logo?: string }

const PROVIDER_OPTIONS: ProviderOption[] = [
    { value: 'all', label: 'All providers' },
    { value: 'telegram', label: 'Telegram', logo: '/images/telegram-logo-lubot.png' },
    { value: 'whatsapp', label: 'WhatsApp', logo: '/images/whatsapp-logo-lubot.png' },
    { value: 'discord',  label: 'Discord',  logo: '/images/discord-logo-lubot.webp' },
    { value: 'slack',    label: 'Slack',     logo: '/images/slack-logo-lubot.png' },
]

function ProviderOptionRow({ opt }: { opt: ProviderOption }) {
    return (
        <div className="flex items-center gap-2">
            {opt.logo && (
                <Image src={opt.logo} alt={opt.label} width={16} height={16} className="rounded-sm object-contain shrink-0" />
            )}
            <span>{opt.label}</span>
        </div>
    )
}

function GroupsContent() {
    const { data: groups = [], isLoading, isError } = useGroups()
    const [nameFilter, setNameFilter] = useState('')
    const [providerFilter, setProviderFilter] = useState<'all' | Platform>('all')

    const filteredGroups = useMemo(() => {
        const name = nameFilter.trim().toLowerCase()
        return groups.filter((g) => {
            const matchesName = !name || g.name.toLowerCase().includes(name)
            const matchesProvider = providerFilter === 'all' || g.platform === providerFilter
            return matchesName && matchesProvider
        })
    }, [groups, nameFilter, providerFilter])

    const hasActiveFilters = nameFilter.trim() !== '' || providerFilter !== 'all'
    const selectedOption = PROVIDER_OPTIONS.find((o) => o.value === providerFilter) ?? PROVIDER_OPTIONS[0]

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your connected groups across providers.
                    </p>
                </div>
                <ConnectGroupDialog>
                    <Button>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Connect Group
                    </Button>
                </ConnectGroupDialog>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Input
                    placeholder="Search by name…"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="h-9 w-56"
                />
                <Select
                    value={providerFilter}
                    onValueChange={(v) => setProviderFilter(v as 'all' | Platform)}
                >
                    <SelectTrigger className="h-9 w-48">
                        {/* Custom trigger renders logo + label of selected option */}
                        <ProviderOptionRow opt={selectedOption} />
                    </SelectTrigger>
                    <SelectContent>
                        {PROVIDER_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                <ProviderOptionRow opt={opt} />
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isError ? (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    Failed to load groups. Check your Supabase connection.
                </div>
            ) : (
                <GroupsTable
                    groups={filteredGroups}
                    isLoading={isLoading}
                    emptyVariant={hasActiveFilters ? 'no-results' : 'no-data'}
                />
            )}
        </div>
    )
}

export default function GroupsPage() {
    return (
        <LubotShell>
            <GroupsContent />
        </LubotShell>
    )
}
