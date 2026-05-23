"use client"

import { useState } from 'react'
import { CheckCircle, Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConnectGroup } from '@/lib/api/queries'
import type { Group } from '@/types'

interface ConnectGroupDialogProps {
    children: React.ReactNode
}

type Step = 'instructions' | 'verify' | 'confirm'

export function ConnectGroupDialog({ children }: ConnectGroupDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<Step>('instructions')
    const [chatId, setChatId] = useState('')
    const [connectedGroup, setConnectedGroup] = useState<Group | null>(null)
    const [error, setError] = useState<string | null>(null)

    const { mutateAsync: connectGroup, isPending } = useConnectGroup()

    function handleClose(isOpen: boolean) {
        setOpen(isOpen)
        if (!isOpen) {
            setStep('instructions')
            setChatId('')
            setConnectedGroup(null)
            setError(null)
        }
    }

    async function handleVerify() {
        setError(null)
        try {
            const group = await connectGroup(chatId.trim())
            setConnectedGroup(group)
            setStep('confirm')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to connect group')
        }
    }

    function handleDone() {
        handleClose(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                {step === 'instructions' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Connect a Telegram Group</DialogTitle>
                            <DialogDescription>
                                Follow these steps to connect your group to Lubot.
                            </DialogDescription>
                        </DialogHeader>
                        <ol className="space-y-3 text-sm">
                            <li className="flex gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                    1
                                </span>
                                <span>
                                    Add <strong>@lubot_broadcast_bot</strong> to your Telegram group.
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                    2
                                </span>
                                <span>
                                    Make the bot an <strong>admin</strong> in the group (required to send messages).
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                    3
                                </span>
                                <span>
                                    In <strong>@BotFather</strong>: <em>Bot Settings</em> →{' '}
                                    <em>Group Privacy</em> → <strong>Turn off</strong>. Required so
                                    Lubot can read group messages for the knowledge base.
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                    4
                                </span>
                                <span>
                                    Get your group&apos;s Chat ID. Add{' '}
                                    <strong>@userinfobot</strong> to the group — it will reply with the Chat ID. Group IDs are negative numbers, e.g.{' '}
                                    <code className="text-xs bg-muted px-1 rounded">-1001234567890</code>.
                                </span>
                            </li>
                        </ol>
                        <DialogFooter>
                            <Button onClick={() => setStep('verify')} className="w-full">
                                I&apos;ve done this — enter Chat ID
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 'verify' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Enter Chat ID</DialogTitle>
                            <DialogDescription>
                                Paste your Telegram group&apos;s Chat ID below to verify and connect.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <Label htmlFor="chatId">Chat ID</Label>
                            <Input
                                id="chatId"
                                placeholder="-1001234567890"
                                value={chatId}
                                onChange={(e) => setChatId(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && chatId.trim()) handleVerify()
                                }}
                            />
                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => { setStep('instructions'); setError(null) }}
                                disabled={isPending}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleVerify}
                                disabled={!chatId.trim() || isPending}
                            >
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify & Connect
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 'confirm' && connectedGroup && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Group Connected!</DialogTitle>
                            <DialogDescription>
                                Your group has been successfully added to Lubot.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="font-semibold">{connectedGroup.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{connectedGroup.member_count?.toLocaleString() ?? '—'} members</span>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleDone} className="w-full">
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
