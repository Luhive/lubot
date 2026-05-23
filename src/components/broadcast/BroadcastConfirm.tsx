"use client"

import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface BroadcastConfirmProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    groupCount: number
    message: string
    scheduledAt?: string
    groupNames?: string[]
    onConfirm: () => void
    isPending?: boolean
}

export function BroadcastConfirm({
    open,
    onOpenChange,
    groupCount,
    message,
    scheduledAt,
    groupNames,
    onConfirm,
    isPending,
}: BroadcastConfirmProps) {
    const preview =
        message.length > 200 ? `${message.slice(0, 200)}…` : message

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {scheduledAt ? 'Schedule broadcast?' : 'Send broadcast now?'}
                    </DialogTitle>
                    <DialogDescription>
                        {scheduledAt
                            ? `This message will be saved and marked scheduled. It will not be sent to Telegram until a delivery job runs (not implemented for the demo).`
                            : `This will send immediately to ${groupCount} group${groupCount === 1 ? '' : 's'} via Telegram.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-sm">
                    <div>
                        <p className="font-medium text-muted-foreground">Recipients</p>
                        <p>
                            {groupCount} group{groupCount === 1 ? '' : 's'}
                            {groupNames && groupNames.length > 0 && (
                                <span className="text-muted-foreground">
                                    {' '}
                                    ({groupNames.slice(0, 3).join(', ')}
                                    {groupNames.length > 3
                                        ? ` +${groupNames.length - 3} more`
                                        : ''}
                                    )
                                </span>
                            )}
                        </p>
                    </div>
                    {scheduledAt && (
                        <div>
                            <p className="font-medium text-muted-foreground">Scheduled for</p>
                            <p>{format(new Date(scheduledAt), 'PPpp')}</p>
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-muted-foreground">Message preview</p>
                        <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                            {preview}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {scheduledAt ? 'Schedule' : 'Send now'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
