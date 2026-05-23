export const MOCK_STATS = {
    totalGroups: 47,
    totalBroadcasts: 312,
    groupsReachedThisWeek: 89,
    agentQueriesAnswered: 1247,
}

/** Hackathon demo — the three connected Telegram groups */
export const HACKATHON_DEMO_GROUPS = [
    {
        id: 'demo-neurotime',
        name: 'Neurotime Team',
        platform: 'telegram' as const,
        telegram_chat_id: null,
        member_count: 28,
        is_active: true,
        connected_at: '2026-05-10T00:00:00Z',
        updated_at: null,
    },
    {
        id: 'demo-amcham',
        name: 'Amcham Network',
        platform: 'telegram' as const,
        telegram_chat_id: null,
        member_count: 41,
        is_active: true,
        connected_at: '2026-04-20T00:00:00Z',
        updated_at: null,
    },
    {
        id: 'demo-accessbank',
        name: 'AccessBank Internal',
        platform: 'telegram' as const,
        telegram_chat_id: null,
        member_count: 34,
        is_active: true,
        connected_at: '2026-04-01T00:00:00Z',
        updated_at: null,
    },
]

export const MOCK_BROADCASTS = [
    {
        id: '1',
        message: 'Important update regarding our Q2 loan rates. Please check the document attached.',
        groupCount: 3,
        status: 'sent',
        sentAt: '2026-05-22T09:00:00Z',
        platform: 'telegram',
    },
    {
        id: '2',
        message: 'Reminder: The Banking & Finance committee session is tomorrow at 14:00.',
        groupCount: 2,
        status: 'sent',
        sentAt: '2026-05-21T17:30:00Z',
        platform: 'telegram',
    },
    {
        id: '3',
        message: 'New onboarding materials have been published. Please share with your teams.',
        groupCount: 3,
        status: 'scheduled',
        sentAt: '2026-05-24T09:00:00Z',
        platform: 'telegram',
    },
    {
        id: '4',
        message: 'System maintenance window this weekend: Saturday 02:00–04:00 AZT.',
        groupCount: 3,
        status: 'sent',
        sentAt: '2026-05-20T12:00:00Z',
        platform: 'telegram',
    },
    {
        id: '5',
        message: 'Welcome to all new members who joined this week!',
        groupCount: 1,
        status: 'sent',
        sentAt: '2026-05-19T10:15:00Z',
        platform: 'telegram',
    },
]

export const MOCK_REPLIERS = [
    { name: 'Aynur H.', seed: 'aynur' },
    { name: 'Rashad M.', seed: 'rashad' },
    { name: 'Leyla K.', seed: 'leyla' },
    { name: 'Orxan T.', seed: 'orxan' },
    { name: 'Nigar S.', seed: 'nigar' },
    { name: 'Elvin Q.', seed: 'elvin' },
    { name: 'Gunay A.', seed: 'gunay' },
    { name: 'Samir B.', seed: 'samir' },
    { name: 'Dilara V.', seed: 'dilara' },
    { name: 'Tural R.', seed: 'tural' },
] as const

export const MOCK_GROUPS = [
    {
        id: 'mg1',
        name: 'Branch Managers — Baku',
        memberCount: 34,
        platform: 'telegram',
        connectedAt: '2026-04-01',
    },
    {
        id: 'mg2',
        name: 'Customer Service Team',
        memberCount: 87,
        platform: 'telegram',
        connectedAt: '2026-04-01',
    },
    {
        id: 'mg3',
        name: 'Marketing — East Region',
        memberCount: 12,
        platform: 'telegram',
        connectedAt: '2026-04-15',
    },
    {
        id: 'mg4',
        name: 'Banking & Finance Committee',
        memberCount: 41,
        platform: 'telegram',
        connectedAt: '2026-04-20',
    },
    {
        id: 'mg5',
        name: 'HR & Onboarding',
        memberCount: 19,
        platform: 'telegram',
        connectedAt: '2026-05-01',
    },
    {
        id: 'mg6',
        name: 'AI Working Group',
        memberCount: 28,
        platform: 'telegram',
        connectedAt: '2026-05-10',
    },
]

export const MOCK_ANALYTICS_CHART = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
    sent: Math.floor(Math.random() * 20) + 2,
    groups: Math.floor(Math.random() * 40) + 5,
}))
