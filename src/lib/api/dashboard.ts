import type {
    ChartDataPoint,
    DashboardBroadcastRow,
    DashboardStats,
} from '@/lib/dashboard/merge-stats'
import type { Group } from '@/types'

export interface DashboardData {
    stats: DashboardStats
    chart: ChartDataPoint[]
    broadcasts: DashboardBroadcastRow[]
    groups: Group[]
}

export async function fetchDashboard(): Promise<DashboardData> {
    const res = await fetch('/api/dashboard')
    if (!res.ok) throw new Error('Failed to fetch dashboard')
    return res.json() as Promise<DashboardData>
}
