import type { AgentChatSelection } from '@/lib/agent-group-context'
import { getKnowledgeContextForSelection } from '@/lib/agent-group-context'
import type { Group, KnowledgeContext } from '@/types'

export const SUGGESTED_QUESTIONS: Record<KnowledgeContext | 'all', string[]> = {
    all: [
        'What are the main topics across our groups?',
        'Who are the most active contributors?',
        'Summarize recent community activity',
        'What onboarding resources do we have?',
        'How do I get started in a new group?',
    ],
    demo: [
        'Who are the main contributors?',
        'What are the community rules?',
        "What's being worked on right now?",
        'When is the next event?',
        'How do I get involved?',
    ],
    accessbank: [
        'How do I onboard a new branch employee?',
        'What is the customer dispute process?',
        'What are the current loan products?',
        'Which internal tools do we use?',
        'What are the company values?',
    ],
    amcham: [
        'What committees can I join?',
        'What has the AI Working Group worked on?',
        'How do I attend events?',
        'What are the membership tiers?',
        'What white papers were published recently?',
    ],
    neurotime: [
        "What's our tech stack?",
        'Why did we choose BERT for Azerbaijani NLP?',
        'What are the current team priorities?',
        'How are client groups managed?',
        'What are the team norms for code review?',
    ],
}

export function getSuggestedQuestionsForSelection(
    selection: AgentChatSelection,
    groups: Group[],
): string[] {
    if (selection === 'all') return SUGGESTED_QUESTIONS.all
    return SUGGESTED_QUESTIONS[getKnowledgeContextForSelection(selection, groups)]
}
