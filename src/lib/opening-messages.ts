import {
    type AgentChatSelection,
    findGroupBySelection,
    getApiContextForSelection,
} from '@/lib/agent-group-context'
import type { ChatMessage, Group, KnowledgeContext } from '@/types'

export const OPENING_MESSAGES: Record<KnowledgeContext | 'all', string> = {
    all: "Hi! I'm connected to all your groups. Ask me anything across your communities — I'll use the knowledge base that best matches your question.",
    demo: "Hi! I have access to this community's full history — rules, ongoing projects, past decisions, and who's who. Ask me anything.",
    accessbank:
        "Hello. I'm trained on AccessBank's internal communications. Ask me about products, procedures, onboarding workflows, or team norms.",
    amcham: 'Welcome to AmCham. I can answer questions about our committees, events, 30 years of institutional history, and how membership works.',
    neurotime:
        "Hey. I have context on Neurotime's full team history — tech decisions, client setups, model architecture choices, and current priorities. What do you need?",
}

export function getOpeningMessage(context: KnowledgeContext | 'all'): ChatMessage {
    return {
        role: 'assistant',
        content: OPENING_MESSAGES[context],
    }
}

export function getOpeningMessageForSelection(
    selection: AgentChatSelection,
    groups: Group[],
): ChatMessage {
    const apiContext = getApiContextForSelection(selection, groups)
    if (apiContext === 'all') {
        return getOpeningMessage('all')
    }
    const group = findGroupBySelection(selection, groups)
    if (group) {
        const ctx = getApiContextForSelection(selection, groups) as KnowledgeContext
        const base = OPENING_MESSAGES[ctx]
        return {
            role: 'assistant',
            content: `You're chatting about ${group.name}. ${base}`,
        }
    }
    return getOpeningMessage(apiContext as KnowledgeContext)
}
