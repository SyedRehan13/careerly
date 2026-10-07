import type { Application, ApplicationInput, ApplicationStatus } from '../types/application'
import { apiClient, getAuthenticatedHeaders } from './api'

export const applicationsQueryKey = (userId: string) => ['applications', userId] as const
export const APPLICATIONS_PAGE_SIZE = 20

export async function getApplications(userId: string, page: number, status: ApplicationStatus | null, signal?: AbortSignal): Promise<Application[]> {
  const headers = await getAuthenticatedHeaders(userId)
  const { data } = await apiClient.get<Application[]>('/api/v1/applications', {
    headers, signal, timeout: 15_000,
    params: { limit: APPLICATIONS_PAGE_SIZE + 1, offset: page * APPLICATIONS_PAGE_SIZE, status: status ?? undefined },
  })
  return data
}

export async function createApplication(userId: string, input: ApplicationInput): Promise<Application> {
  const headers = await getAuthenticatedHeaders(userId)
  const { data } = await apiClient.post<Application>('/api/v1/applications', input, { headers, timeout: 15_000 })
  return data
}

export async function updateApplication(userId: string, id: string, input: ApplicationInput): Promise<Application> {
  const headers = await getAuthenticatedHeaders(userId)
  const { data } = await apiClient.patch<Application>(`/api/v1/applications/${id}`, input, { headers, timeout: 15_000 })
  return data
}

export async function deleteApplication(userId: string, id: string): Promise<void> {
  const headers = await getAuthenticatedHeaders(userId)
  await apiClient.delete(`/api/v1/applications/${id}`, { headers, timeout: 15_000 })
}
