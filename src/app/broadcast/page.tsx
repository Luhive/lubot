"use client"

import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { BroadcastComposer } from '@/components/broadcast/BroadcastComposer'
import { BroadcastConfirm } from '@/components/broadcast/BroadcastConfirm'
import type { BroadcastComposerPayload } from '@/components/broadcast/types'
import { LubotShell } from '@/components/layout/LubotShell'
import { toast } from '@/hooks/use-toast'
import { useGroups, useSendBroadcast } from '@/lib/api/queries'

function BroadcastContent() {
    const { data: allGroups = [], isLoading, isError } = useGroups()
    const { mutateAsync: sendBroadcast, isPending } = useSendBroadcast()

    const telegramGroups = useMemo(
        () => allGroups.filter((g) => g.platform === 'telegram' && g.is_active),
        [allGroups],
    )

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingPayload, setPendingPayload] = useState<BroadcastComposerPayload | null>(
        null,
    )
    const [resetSignal, setResetSignal] = useState(0)

    const selectedGroupNames = useMemo(() => {
        if (!pendingPayload) return []
        return telegramGroups
            .filter((g) => pendingPayload.groupIds.includes(g.id))
            .map((g) => g.name)
    }, [telegramGroups, pendingPayload])

    function handleRequestConfirm(payload: BroadcastComposerPayload) {
        setPendingPayload(payload)
        setConfirmOpen(true)
    }

    async function handleConfirm() {
        if (!pendingPayload) return

        try {
            const result = await sendBroadcast({
                groupIds: pendingPayload.groupIds,
                message: pendingPayload.message,
                scheduledAt: pendingPayload.scheduledAt,
            })

            const { broadcast, results } = result
            const count = pendingPayload.groupIds.length

            if (broadcast.status === 'scheduled') {
                toast({
                    title: 'Broadcast scheduled',
                    description: pendingPayload.scheduledAt
                        ? format(new Date(pendingPayload.scheduledAt), 'PPpp')
                        : undefined,
                })
            } else if (broadcast.status === 'sent') {
                toast({
                    title: 'Broadcast sent',
                    description: `Message delivered to ${count} group${count === 1 ? '' : 's'}.`,
                })
            } else if (broadcast.status === 'partial') {
                const failed = results.filter((r) => !r.success).length
                toast({
                    variant: 'destructive',
                    title: 'Partially sent',
                    description: `${results.length - failed} succeeded, ${failed} failed.`,
                })
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Broadcast failed',
                    description: 'Could not deliver to any groups. Check bot admin rights.',
                })
            }

            setConfirmOpen(false)
            setPendingPayload(null)
            setResetSignal((n) => n + 1)
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Could not send broadcast',
                description: err instanceof Error ? err.message : 'Unknown error',
            })
        }
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
            <div className="shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Broadcast</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Send a message to multiple Telegram groups. Use + or @ to pick recipients.
                </p>
            </div>

            {isError && (
                <div className="shrink-0 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    Failed to load groups. Check your Supabase connection.
                </div>
            )}

            <BroadcastComposer
                className="min-h-0 flex-1"
                groups={telegramGroups}
                isLoading={isLoading}
                disabled={isPending}
                resetSignal={resetSignal}
                onRequestConfirm={handleRequestConfirm}
            />

            <BroadcastConfirm
                open={confirmOpen}
                onOpenChange={(open) => {
                    setConfirmOpen(open)
                    if (!open) setPendingPayload(null)
                }}
                groupCount={pendingPayload?.groupIds.length ?? 0}
                message={pendingPayload?.message ?? ''}
                scheduledAt={pendingPayload?.scheduledAt}
                groupNames={selectedGroupNames}
                onConfirm={handleConfirm}
                isPending={isPending}
            />
        </div>
    )
}

export default function BroadcastPage() {
    return (
        <LubotShell>
            <BroadcastContent />
        </LubotShell>
    )
}
