"use client"

import { useState } from 'react'
import { ChatArea } from '@/components/agent/ChatArea'
import { CompactInsightsBar } from '@/components/agent/CompactInsightsBar'
import { LubotShell } from '@/components/layout/LubotShell'
import { useGroups } from '@/lib/api/queries'
import {
    type AgentChatSelection,
    getKnowledgeContextForSelection,
} from '@/lib/agent-group-context'

export default function AgentPage() {
    const [selectedChatId, setSelectedChatId] = useState<AgentChatSelection>('all')
    const { data: groups = [], isLoading: groupsLoading } = useGroups()

    const knowledgeContext = getKnowledgeContextForSelection(selectedChatId, groups)

    return (
        <LubotShell>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/40 p-5 md:p-6">
                <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col gap-4">
                    <CompactInsightsBar context={knowledgeContext} />
                    <div className="min-h-0 flex-1 overflow-hidden">
                        <ChatArea
                            selectedChatId={selectedChatId}
                            onChatChange={setSelectedChatId}
                            groups={groups}
                            groupsLoading={groupsLoading}
                        />
                    </div>
                </div>
            </div>
        </LubotShell>
    )
}
