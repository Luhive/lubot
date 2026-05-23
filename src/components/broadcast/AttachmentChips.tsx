"use client"

import { ImageIcon, Mic, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MockAttachment } from '@/components/broadcast/types'

interface AttachmentChipsProps {
    attachments: MockAttachment[]
    onRemove: (id: string) => void
}

export function AttachmentChips({ attachments, onRemove }: AttachmentChipsProps) {
    if (attachments.length === 0) return null

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap gap-2">
                {attachments.map((att) => (
                    <span
                        key={att.id}
                        className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs"
                    >
                        {att.type === 'image' ? (
                            <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                            <Mic className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="max-w-[160px] truncate">
                            {att.type === 'image'
                                ? `${att.filename} · ${att.size}`
                                : `Voice note · ${att.duration}`}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => onRemove(att.id)}
                            aria-label="Remove attachment"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </span>
                ))}
            </div>
            <p className="text-[10px] text-muted-foreground">Attachments are visual-only for the demo.</p>
        </div>
    )
}
