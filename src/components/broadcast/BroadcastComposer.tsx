"use client"

import { format } from 'date-fns'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    ArrowUp,
    Clock,
    ImageIcon,
    Mic,
    Plus,
} from 'lucide-react'
import { AttachmentChips } from '@/components/broadcast/AttachmentChips'
import { GroupMentionMenu } from '@/components/broadcast/GroupMentionMenu'
import { RecipientChips } from '@/components/broadcast/RecipientChips'
import { SuggestedGroupChips } from '@/components/broadcast/SuggestedGroupChips'
import type { BroadcastComposerPayload, MockAttachment } from '@/components/broadcast/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { Group } from '@/types'

const MAX_MESSAGE_LENGTH = 4096

interface BroadcastComposerProps {
    groups: Group[]
    isLoading?: boolean
    disabled?: boolean
    resetSignal?: number
    onRequestConfirm: (payload: BroadcastComposerPayload) => void
    className?: string
}

function minDatetimeLocal(): string {
    const d = new Date()
    d.setMinutes(d.getMinutes() + 1)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function newId() {
    return crypto.randomUUID()
}

function findMentionAtCaret(text: string, caret: number) {
    const before = text.slice(0, caret)
    const atIndex = before.lastIndexOf('@')
    if (atIndex === -1) return null

    const charBefore = atIndex > 0 ? before[atIndex - 1] : ' '
    if (charBefore !== ' ' && charBefore !== '\n') return null

    const query = before.slice(atIndex + 1)
    if (/\s/.test(query)) return null

    return { start: atIndex, end: caret, query }
}

export function BroadcastComposer({
    groups,
    isLoading,
    disabled,
    resetSignal = 0,
    onRequestConfirm,
    className,
}: BroadcastComposerProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [message, setMessage] = useState('')
    const [attachments, setAttachments] = useState<MockAttachment[]>([])
    const [scheduleEnabled, setScheduleEnabled] = useState(false)
    const [scheduledAt, setScheduledAt] = useState('')
    const [mentionOpen, setMentionOpen] = useState(false)
    const [mentionQuery, setMentionQuery] = useState('')
    const [mentionRange, setMentionRange] = useState<{ start: number; end: number } | null>(
        null,
    )
    const [plusOpen, setPlusOpen] = useState(false)
    const [scheduleOpen, setScheduleOpen] = useState(false)
    const [mockToastShown, setMockToastShown] = useState(false)

    const selectedGroups = useMemo(
        () => groups.filter((g) => selectedIds.includes(g.id)),
        [groups, selectedIds],
    )

    const filteredMentionGroups = useMemo(() => {
        const q = mentionQuery.trim().toLowerCase()
        if (!q) return groups
        return groups.filter((g) => g.name.toLowerCase().includes(q))
    }, [groups, mentionQuery])

    const scheduleValid =
        scheduleEnabled &&
        scheduledAt !== '' &&
        new Date(scheduledAt).getTime() > Date.now()

    const canSend =
        selectedIds.length > 0 &&
        message.trim().length > 0 &&
        message.length <= MAX_MESSAGE_LENGTH &&
        (!scheduleEnabled || scheduleValid)

    const resetComposer = useCallback(() => {
        setSelectedIds([])
        setMessage('')
        setAttachments([])
        setScheduleEnabled(false)
        setScheduledAt('')
        setMentionOpen(false)
        setMentionQuery('')
        setMentionRange(null)
        setPlusOpen(false)
        setScheduleOpen(false)
    }, [])

    useEffect(() => {
        if (resetSignal > 0) resetComposer()
    }, [resetSignal, resetComposer])

    function updateMentionFromText(value: string, caret: number) {
        const mention = findMentionAtCaret(value, caret)
        if (mention) {
            setMentionOpen(true)
            setMentionQuery(mention.query)
            setMentionRange({ start: mention.start, end: mention.end })
        } else {
            setMentionOpen(false)
            setMentionQuery('')
            setMentionRange(null)
        }
    }

    function handleMessageChange(value: string) {
        setMessage(value)
        const caret = textareaRef.current?.selectionStart ?? value.length
        updateMentionFromText(value, caret)
    }

    function addRecipient(group: Group) {
        setSelectedIds((prev) =>
            prev.includes(group.id) ? prev : [...prev, group.id],
        )
    }

    function handleMentionSelect(group: Group) {
        if (mentionRange) {
            const before = message.slice(0, mentionRange.start)
            const after = message.slice(mentionRange.end)
            const next = before + after
            setMessage(next)
            requestAnimationFrame(() => {
                const el = textareaRef.current
                if (el) {
                    el.focus()
                    el.setSelectionRange(mentionRange.start, mentionRange.start)
                }
            })
        }
        addRecipient(group)
        setMentionOpen(false)
        setMentionQuery('')
        setMentionRange(null)
    }

    function handlePlusSelect(group: Group) {
        addRecipient(group)
        setPlusOpen(false)
    }

    function showMockAttachmentToast() {
        if (!mockToastShown) {
            setMockToastShown(true)
            toast({
                title: 'Demo attachments',
                description: 'Image and voice attachments are visual-only for the demo.',
            })
        }
    }

    function addMockImage() {
        showMockAttachmentToast()
        setAttachments((prev) => [
            ...prev,
            { id: newId(), type: 'image', filename: 'screenshot.png', size: '1.2 MB' },
        ])
    }

    function addMockVoice() {
        showMockAttachmentToast()
        setAttachments((prev) => [
            ...prev,
            { id: newId(), type: 'voice', duration: '0:12' },
        ])
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Escape' && mentionOpen) {
            e.preventDefault()
            setMentionOpen(false)
            return
        }

        if (mentionOpen && (e.key === 'Enter' || e.key === 'Tab')) {
            const first = filteredMentionGroups.find((g) => !selectedIds.includes(g.id))
            if (first) {
                e.preventDefault()
                handleMentionSelect(first)
            }
        }
    }

    function handleSendClick() {
        if (!canSend || disabled) return

        onRequestConfirm({
            groupIds: selectedIds,
            message: message.trim(),
            scheduledAt:
                scheduleEnabled && scheduledAt
                    ? new Date(scheduledAt).toISOString()
                    : undefined,
        })
    }

    const scheduleLabel =
        scheduleEnabled && scheduledAt
            ? format(new Date(scheduledAt), 'PP p')
            : 'Schedule'

    return (
        <div className={cn('flex min-h-0 flex-1 flex-col gap-3', className)}>
            <SuggestedGroupChips
                groups={groups}
                selectedIds={selectedIds}
                onSelect={addRecipient}
                isLoading={isLoading}
            />

            <Card className="flex min-h-0 flex-1 flex-col overflow-visible border shadow-sm">
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-visible p-4">
                <RecipientChips
                    groups={selectedGroups}
                    onRemove={(id) =>
                        setSelectedIds((prev) => prev.filter((x) => x !== id))
                    }
                />

                <div className="relative shrink-0">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => handleMessageChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onClick={() => {
                            const el = textareaRef.current
                            if (el) updateMentionFromText(message, el.selectionStart)
                        }}
                        onKeyUp={() => {
                            const el = textareaRef.current
                            if (el) updateMentionFromText(message, el.selectionStart)
                        }}
                        placeholder="Write your broadcast message… Type @ to mention a group"
                        disabled={disabled}
                        className={cn(
                            'min-h-[200px] resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0',
                            message.length > MAX_MESSAGE_LENGTH && 'text-destructive',
                        )}
                    />

                    {mentionOpen && (
                        <div
                            className="absolute left-0 top-full z-50 mt-1 w-72 max-w-full rounded-md border bg-popover p-2 shadow-md"
                            role="listbox"
                        >
                            <GroupMentionMenu
                                variant="mention"
                                groups={groups}
                                selectedIds={selectedIds}
                                query={mentionQuery}
                                onSelect={handleMentionSelect}
                                isLoading={isLoading}
                            />
                        </div>
                    )}
                </div>

                <div className="min-h-0 flex-1" aria-hidden />

                <AttachmentChips
                    attachments={attachments}
                    onRemove={(id) =>
                        setAttachments((prev) => prev.filter((a) => a.id !== id))
                    }
                />
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-1 p-2">
                <DropdownMenu open={plusOpen} onOpenChange={setPlusOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            disabled={disabled || isLoading}
                            aria-label="Add recipients"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-72 p-2">
                        <GroupMentionMenu
                            groups={groups}
                            selectedIds={selectedIds}
                            onSelect={handlePlusSelect}
                            showSearch
                            isLoading={isLoading}
                        />
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={disabled}
                    onClick={addMockImage}
                    title="Attach image (mock)"
                    aria-label="Attach image (mock)"
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={disabled}
                    onClick={addMockVoice}
                    title="Voice note (mock)"
                    aria-label="Voice note (mock)"
                >
                    <Mic className="h-4 w-4" />
                </Button>

                <DropdownMenu open={scheduleOpen} onOpenChange={setScheduleOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant={scheduleEnabled ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8"
                            disabled={disabled}
                        >
                            <Clock className="mr-1.5 h-4 w-4" />
                            <span className="max-w-[140px] truncate text-xs sm:text-sm">
                                {scheduleLabel}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72 p-3" align="start">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="composer-schedule"
                                    checked={scheduleEnabled}
                                    onCheckedChange={(c) => setScheduleEnabled(c === true)}
                                    disabled={disabled}
                                />
                                <Label htmlFor="composer-schedule" className="cursor-pointer">
                                    Schedule for later
                                </Label>
                            </div>
                            {scheduleEnabled && (
                                <Input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                    min={minDatetimeLocal()}
                                    disabled={disabled}
                                />
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <span
                    className={cn(
                        'ml-auto text-xs tabular-nums',
                        message.length > MAX_MESSAGE_LENGTH
                            ? 'text-destructive font-medium'
                            : 'text-muted-foreground',
                    )}
                >
                    {message.length.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()}
                </span>

                <Button
                    type="button"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full"
                    disabled={!canSend || disabled}
                    onClick={handleSendClick}
                    aria-label={scheduleEnabled ? 'Schedule broadcast' : 'Send broadcast'}
                >
                    <ArrowUp className="h-4 w-4" />
                </Button>
            </div>
        </Card>
        </div>
    )
}
