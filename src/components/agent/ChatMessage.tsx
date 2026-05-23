"use client"

import { BotIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
    role: 'user' | 'assistant'
    content: string
    isStreaming?: boolean
}

function TypingIndicator() {
    return (
        <span className="inline-flex items-center gap-1" aria-label="Assistant is typing">
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
        </span>
    )
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
    const isUser = role === 'user'
    const showTyping = isStreaming && content === ''

    return (
        <div
            className={cn(
                'flex w-full gap-2.5',
                isUser ? 'justify-end' : 'justify-start',
            )}
        >
            {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950">
                    <BotIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                </div>
            )}
            <div
                className={cn(
                    'max-w-[80%] px-4 py-2.5 text-sm leading-relaxed',
                    isUser
                        ? 'rounded-2xl rounded-br-md bg-sky-600 text-white'
                        : 'rounded-2xl rounded-bl-md border border-border/40 bg-card shadow-sm text-foreground',
                )}
            >
                {showTyping ? (
                    <TypingIndicator />
                ) : (
                    <p className="whitespace-pre-wrap break-words">{content}</p>
                )}
            </div>
        </div>
    )
}
