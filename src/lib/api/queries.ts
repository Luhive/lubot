import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sendBroadcast, type SendBroadcastParams } from './broadcast'
import { fetchDashboard } from './dashboard'
import { connectGroup, fetchGroups } from './groups'

export const groupKeys = {
    all: ['groups'] as const,
    list: () => [...groupKeys.all, 'list'] as const,
}

export const broadcastKeys = {
    all: ['broadcasts'] as const,
}

export const dashboardKeys = {
    all: ['dashboard'] as const,
}

export function useGroups() {
    return useQuery({
        queryKey: groupKeys.list(),
        queryFn: fetchGroups,
    })
}

export function useConnectGroup() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: connectGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.all })
        },
    })
}

export function useDashboard() {
    return useQuery({
        queryKey: dashboardKeys.all,
        queryFn: fetchDashboard,
    })
}

export function useSendBroadcast() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (params: SendBroadcastParams) => sendBroadcast(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
        },
    })
}
