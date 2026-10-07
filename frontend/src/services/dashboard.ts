import type { DashboardSummary } from '../types/dashboard'
import { apiClient, getAuthenticatedHeaders } from './api'

export const dashboardQueryKey = (userId: string) => ['dashboard', userId] as const

export async function getDashboardSummary(userId: string, asOfDate: string, signal?: AbortSignal): Promise<DashboardSummary> {
  const headers = await getAuthenticatedHeaders(userId)
  const { data } = await apiClient.get<DashboardSummary>('/api/v1/dashboard/summary', {
    headers, signal, timeout: 15000,
    params: { as_of_date: asOfDate, recent_limit: 5, follow_up_limit: 5 },
  })
  return data
}
