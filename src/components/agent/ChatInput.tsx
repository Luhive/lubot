"use client"

import { useState } from 'react'
import { SendIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
    onSend: (text: string) => void
    disabled?: boolean
    variant?: 'default' | 'embedded'
}

export function ChatInput({
    onSend,
    disabled = false,
    variant = 'default',
}: ChatInputProps) {
    const [value, setValue] = useState('')

    function handleSend() {
        const trimmed = value.trim()
        if (!trimmed || disabled) return
        onSend(trimmed)
        setValue('')
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (variant === 'embedded') {
        return (
            <div className="flex shrink-0 items-end gap-3 border-t border-border/40 px-5 pb-5 pt-3">
                <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about this community or organization…"
                    disabled={disabled}
                    rows={1}
                    className="min-h-[38px] max-h-[96px] resize-none rounded-xl border-0 bg-muted/50 text-sm focus-visible:ring-1 focus-visible:ring-sky-400"
                />
                <Button
                    type="button"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-xl bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600"
                    onClick={handleSend}
                    disabled={disabled || !value.trim()}
                    aria-label="Send message"
                >
                    <SendIcon className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <div className="flex gap-2 border-t bg-background p-4">
            <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about this community or organization…"
                disabled={disabled}
                rows={2}
                className="min-h-[52px] resize-none"
            />
            <Button
                type="button"
                size="icon"
                className="h-[52px] w-[52px] shrink-0"
                onClick={handleSend}
                disabled={disabled || !value.trim()}
                aria-label="Send message"
            >
                <SendIcon className="h-4 w-4" />
            </Button>
        </div>
    )
}
