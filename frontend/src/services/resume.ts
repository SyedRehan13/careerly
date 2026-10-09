import type { ResumeContent, ResumeResponse } from '../types/resume'
import { apiClient, getAuthenticatedHeaders } from './api'

export const resumeQueryKey = (userId: string) => ['resume', userId] as const

export async function getResume(userId: string, signal?: AbortSignal): Promise<ResumeResponse> {
  const headers = await getAuthenticatedHeaders(userId)
  const { data } = await apiClient.get<ResumeResponse>('/api/v1/users/me/resume', {
    headers,
    signal,
    timeout: 15_000,
  })
  return data
}

export async function saveResume(userId: string, content: ResumeContent): Promise<ResumeResponse> {
  const headers = await getAuthenticatedHeaders(userId)
  const { data } = await apiClient.put<ResumeResponse>('/api/v1/users/me/resume', { content }, {
    headers,
    timeout: 15_000,
  })
  return data
}
