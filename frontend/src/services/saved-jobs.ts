import type { SavedJob, SavedJobInput } from '../types/saved-job'
import { apiClient, getAuthenticatedHeaders } from './api'

export const savedJobsQueryKey = (userId: string) => ['saved-jobs', userId] as const
export const SAVED_JOBS_PAGE_SIZE = 20

export async function getSavedJobs(userId: string, page: number, signal?: AbortSignal): Promise<SavedJob[]> {
  const headers = await getAuthenticatedHeaders(userId)
  const { data } = await apiClient.get<SavedJob[]>('/api/v1/saved-jobs', {
    headers, signal, timeout: 15_000,
    // One extra row tells us whether another page exists.
    params: { limit: SAVED_JOBS_PAGE_SIZE + 1, offset: page * SAVED_JOBS_PAGE_SIZE },
  })
  return data
}

export async function createSavedJob(userId: string, job: SavedJobInput): Promise<SavedJob> {
  const headers = await getAuthenticatedHeaders(userId)
  const { data } = await apiClient.post<SavedJob>('/api/v1/saved-jobs', job, { headers, timeout: 15_000 })
  return data
}

export async function updateSavedJob(userId: string, jobId: string, job: SavedJobInput): Promise<SavedJob> {
  const headers = await getAuthenticatedHeaders(userId)
  const { data } = await apiClient.patch<SavedJob>(`/api/v1/saved-jobs/${jobId}`, job, { headers, timeout: 15_000 })
  return data
}

export async function deleteSavedJob(userId: string, jobId: string): Promise<void> {
  const headers = await getAuthenticatedHeaders(userId)
  await apiClient.delete(`/api/v1/saved-jobs/${jobId}`, { headers, timeout: 15_000 })
}
