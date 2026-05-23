import type { Group, KnowledgeContext } from '@/types'

export type AgentChatSelection = 'all' | string

export type AgentApiContext = KnowledgeContext | 'all'

export function inferKnowledgeContextFromGroup(group: Group): KnowledgeContext {
    const name = group.name.toLowerCase()
    if (name.includes('accessbank') || name.includes('access bank')) return 'accessbank'
    if (name.includes('amcham') || name.includes('chamber')) return 'amcham'
    if (name.includes('neurotime')) return 'neurotime'
    return 'demo'
}

export function findGroupBySelection(
    selection: AgentChatSelection,
    groups: Group[],
): Group | undefined {
    if (selection === 'all') return undefined
    return groups.find((g) => g.id === selection)
}

/** Insights / suggested-question fallback when "All" is selected */
export function getKnowledgeContextForSelection(
    selection: AgentChatSelection,
    groups: Group[],
): KnowledgeContext {
    if (selection === 'all') return 'demo'
    const group = findGroupBySelection(selection, groups)
    return group ? inferKnowledgeContextFromGroup(group) : 'demo'
}

/** Context sent to /api/agent/chat */
export function getApiContextForSelection(
    selection: AgentChatSelection,
    groups: Group[],
): AgentApiContext {
    if (selection === 'all') return 'all'
    const group = findGroupBySelection(selection, groups)
    return group ? inferKnowledgeContextFromGroup(group) : 'demo'
}
