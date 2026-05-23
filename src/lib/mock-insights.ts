import type { KnowledgeContext } from '@/types'

export interface CommunityInsightData {
    healthScore: number
    healthTrend: string
    healthLabel: string
    engagementRate: number
    engagementTrend: string
    avgMessagesPerDay: number
    avgMessagesTrend: string
    interests: { label: string; hot: boolean }[]
    activeHours: { day: string; pct: number }[]
    recentConversations: {
        id: string
        initials: string
        avatarColor: string
        from: string
        to: string
        preview: string
        time: string
    }[]
}

export const COMMUNITY_INSIGHTS: Record<KnowledgeContext, CommunityInsightData> = {
    demo: {
        healthScore: 82,
        healthTrend: '↑ +4 this week',
        healthLabel: 'Active community',
        engagementRate: 68,
        engagementTrend: '↑ 5%',
        avgMessagesPerDay: 4.2,
        avgMessagesTrend: '↑ 0.8',
        interests: [
            { label: 'AI / ML', hot: true },
            { label: 'Fintech', hot: true },
            { label: 'Startups', hot: false },
            { label: 'Events', hot: false },
            { label: 'Hiring', hot: false },
            { label: 'Policy', hot: false },
        ],
        activeHours: [
            { day: 'Mon', pct: 75 },
            { day: 'Tue', pct: 90 },
            { day: 'Wed', pct: 60 },
            { day: 'Thu', pct: 82 },
            { day: 'Fri', pct: 45 },
        ],
        recentConversations: [
            {
                id: '1',
                initials: 'AL',
                avatarColor: 'bg-blue-100 text-blue-800',
                from: 'Ali',
                to: 'Leyla',
                preview: 'New NLP model is ready for review',
                time: '2m',
            },
            {
                id: '2',
                initials: 'RF',
                avatarColor: 'bg-green-100 text-green-800',
                from: 'Rauf',
                to: 'Team',
                preview: 'Deployment done. API is live.',
                time: '18m',
            },
            {
                id: '3',
                initials: 'NR',
                avatarColor: 'bg-amber-100 text-amber-800',
                from: 'Nigar',
                to: 'Rauf',
                preview: 'Can we schedule the client demo?',
                time: '1h',
            },
        ],
    },

    accessbank: {
        healthScore: 91,
        healthTrend: '↑ +2 this week',
        healthLabel: 'Highly engaged',
        engagementRate: 84,
        engagementTrend: '↑ 3%',
        avgMessagesPerDay: 7.8,
        avgMessagesTrend: '↑ 1.2',
        interests: [
            { label: 'Loans', hot: true },
            { label: 'Compliance', hot: true },
            { label: 'Onboarding', hot: false },
            { label: 'CRM', hot: false },
            { label: 'Campaigns', hot: false },
            { label: 'Mobile', hot: false },
        ],
        activeHours: [
            { day: 'Mon', pct: 95 },
            { day: 'Tue', pct: 88 },
            { day: 'Wed', pct: 79 },
            { day: 'Thu', pct: 85 },
            { day: 'Fri', pct: 55 },
        ],
        recentConversations: [
            {
                id: '1',
                initials: 'SM',
                avatarColor: 'bg-blue-100 text-blue-800',
                from: 'Samira',
                to: 'Branch Team',
                preview: 'Q2 campaign materials are ready to send',
                time: '5m',
            },
            {
                id: '2',
                initials: 'EH',
                avatarColor: 'bg-purple-100 text-purple-800',
                from: 'Elvin',
                to: 'Compliance',
                preview: 'Updated KYC checklist uploaded to portal',
                time: '32m',
            },
            {
                id: '3',
                initials: 'AJ',
                avatarColor: 'bg-green-100 text-green-800',
                from: 'Aysel',
                to: 'HR',
                preview: 'New branch hire starting Monday, need access',
                time: '2h',
            },
        ],
    },

    amcham: {
        healthScore: 76,
        healthTrend: '→ stable',
        healthLabel: 'Steady activity',
        engagementRate: 59,
        engagementTrend: '↑ 1%',
        avgMessagesPerDay: 3.1,
        avgMessagesTrend: '→ 0.0',
        interests: [
            { label: 'AI Policy', hot: true },
            { label: 'IPO / Capital', hot: true },
            { label: 'HR & Labor', hot: false },
            { label: 'Events', hot: false },
            { label: 'Trade', hot: false },
            { label: 'SME', hot: false },
        ],
        activeHours: [
            { day: 'Mon', pct: 70 },
            { day: 'Tue', pct: 85 },
            { day: 'Wed', pct: 72 },
            { day: 'Thu', pct: 80 },
            { day: 'Fri', pct: 40 },
        ],
        recentConversations: [
            {
                id: '1',
                initials: 'KS',
                avatarColor: 'bg-blue-100 text-blue-800',
                from: 'Kamran',
                to: 'AI WG',
                preview: 'Draft position paper is shared in the folder',
                time: '10m',
            },
            {
                id: '2',
                initials: 'LM',
                avatarColor: 'bg-amber-100 text-amber-800',
                from: 'Lala',
                to: 'Secretariat',
                preview: 'Gala venue confirmed for November',
                time: '1h',
            },
            {
                id: '3',
                initials: 'FH',
                avatarColor: 'bg-green-100 text-green-800',
                from: 'Fidan',
                to: 'Members',
                preview: 'Reminder: Banking committee session tomorrow',
                time: '3h',
            },
        ],
    },

    neurotime: {
        healthScore: 88,
        healthTrend: '↑ +6 this week',
        healthLabel: 'Fast-moving team',
        engagementRate: 92,
        engagementTrend: '↑ 8%',
        avgMessagesPerDay: 11.4,
        avgMessagesTrend: '↑ 2.1',
        interests: [
            { label: 'NLP', hot: true },
            { label: 'Inference', hot: true },
            { label: 'Client ops', hot: false },
            { label: 'Hiring', hot: false },
            { label: 'Georgian', hot: false },
            { label: 'Ad detection', hot: false },
        ],
        activeHours: [
            { day: 'Mon', pct: 88 },
            { day: 'Tue', pct: 95 },
            { day: 'Wed', pct: 91 },
            { day: 'Thu', pct: 85 },
            { day: 'Fri', pct: 72 },
        ],
        recentConversations: [
            {
                id: '1',
                initials: 'AL',
                avatarColor: 'bg-blue-100 text-blue-800',
                from: 'Ali',
                to: 'Leyla',
                preview: 'New NLP model is ready for review',
                time: '2m',
            },
            {
                id: '2',
                initials: 'RF',
                avatarColor: 'bg-green-100 text-green-800',
                from: 'Rauf',
                to: 'Ali',
                preview: 'API latency is down to 120ms now',
                time: '25m',
            },
            {
                id: '3',
                initials: 'TM',
                avatarColor: 'bg-purple-100 text-purple-800',
                from: 'Tural',
                to: 'Team',
                preview: 'Georgian corpus scraping is 60% done',
                time: '1h',
            },
        ],
    },
}
