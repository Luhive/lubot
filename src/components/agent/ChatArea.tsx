"use client"

import { useEffect, useRef, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ChatInput } from '@/components/agent/ChatInput'
import { ChatMessage } from '@/components/agent/ChatMessage'
import { GroupChatSelect } from '@/components/agent/GroupChatSelect'
import { AgentSurfaceCard } from '@/components/agent/AgentSurfaceCard'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AgentApiContext, AgentChatSelection } from '@/lib/agent-group-context'
import { getApiContextForSelection } from '@/lib/agent-group-context'
import { getOpeningMessageForSelection } from '@/lib/opening-messages'
import { getSuggestedQuestionsForSelection } from '@/lib/suggested-questions'
import type { ChatMessage as ChatMessageType, Group } from '@/types'

interface ChatAreaProps {
    selectedChatId: AgentChatSelection
    onChatChange: (id: AgentChatSelection) => void
    groups: Group[]
    groupsLoading?: boolean
}

export function ChatArea({
    selectedChatId,
    onChatChange,
    groups,
    groupsLoading = false,
}: ChatAreaProps) {
    const [messages, setMessages] = useState<ChatMessageType[]>(() => [
        getOpeningMessageForSelection(selectedChatId, groups),
    ])
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done'>('idle')
    const bottomRef = useRef<HTMLDivElement>(null)

    const apiContext: AgentApiContext = getApiContextForSelection(selectedChatId, groups)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isStreaming])

    useEffect(() => {
        setMessages([getOpeningMessageForSelection(selectedChatId, groups)])
        setError(null)
    }, [selectedChatId, groups])

    async function handleSyncData() {
        if (syncState === 'syncing') return
        setSyncState('syncing')
        try {
            const res = await fetch('/api/admin/backfill-embeddings')
            const json = await res.json()
            if (!res.ok) throw new Error(json.error ?? 'Sync failed')
            setSyncState('done')
            toast.success(json.message ?? 'Data synced — knowledge base ready')
        } catch (err) {
            setSyncState('idle')
            toast.error(err instanceof Error ? err.message : 'Sync failed')
        }
    }

    async function handleSend(text: string) {
        const trimmed = text.trim()
        if (!trimmed || isStreaming) return

        const userMessage: ChatMessageType = { role: 'user', content: trimmed }
        const nextMessages = [...messages, userMessage]
        setMessages(nextMessages)
        setError(null)
        setIsStreaming(true)

        setMessages([...nextMessages, { role: 'assistant', content: '' }])

        try {
            const res = await fetch('/api/agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: nextMessages,
                    context: apiContext,
                    groupId: selectedChatId,
                }),
            })

            if (!res.ok) {
                const errText = await res.text()
                throw new Error(errText || `Request failed (${res.status})`)
            }

            const reader = res.body?.getReader()
            if (!reader) throw new Error('No response stream')

            const decoder = new TextDecoder()
            let accumulated = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                accumulated += decoder.decode(value, { stream: true })
                setMessages([...nextMessages, { role: 'assistant', content: accumulated }])
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setMessages(nextMessages)
        } finally {
            setIsStreaming(false)
        }
    }

    const suggested = getSuggestedQuestionsForSelection(selectedChatId, groups)

    const syncLabel =
        syncState === 'syncing'
            ? 'Syncing…'
            : syncState === 'done'
              ? 'Synced'
              : 'Sync the data'

    return (
        <AgentSurfaceCard className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border/40 px-5 py-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Onboarding agent</h1>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Ask anything about this community or organization
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSyncData}
                        disabled={syncState === 'syncing'}
                        className="h-9 gap-1.5 text-xs"
                        title="Sync knowledge base embeddings from Supabase"
                    >
                        {syncState === 'syncing' ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        {syncLabel}
                    </Button>
                    <GroupChatSelect
                        value={selectedChatId}
                        onValueChange={onChatChange}
                        groups={groups}
                        isLoading={groupsLoading}
                    />
                </div>
            </div>

            {error && (
                <div className="mx-5 mt-4 shrink-0 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <ScrollArea className="min-h-0 flex-1 px-5 py-4">
                <div className="rounded-xl bg-muted/30 px-4 py-4">
                    <div className="flex flex-col gap-4">
                        {messages.map((msg, i) => (
                            <ChatMessage
                                key={`${msg.role}-${i}-${msg.content.slice(0, 20)}`}
                                role={msg.role}
                                content={msg.content}
                                isStreaming={
                                    isStreaming &&
                                    i === messages.length - 1 &&
                                    msg.role === 'assistant'
                                }
                            />
                        ))}
                        <div ref={bottomRef} aria-hidden />
                    </div>
                </div>
            </ScrollArea>

            <div className="shrink-0 border-t border-border/40 px-5 py-3">
                <p className="mb-2 text-[11px] font-medium text-muted-foreground">
                    Suggested questions
                </p>
                <div className="flex flex-wrap gap-2">
                    {suggested.map((q) => (
                        <button
                            key={q}
                            type="button"
                            onClick={() => handleSend(q)}
                            disabled={isStreaming}
                            className="rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs shadow-sm transition-colors hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 disabled:opacity-50 dark:hover:bg-sky-950 dark:hover:border-sky-800 dark:hover:text-sky-300"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            <ChatInput onSend={handleSend} disabled={isStreaming} variant="embedded" />
        </AgentSurfaceCard>
    )
}
