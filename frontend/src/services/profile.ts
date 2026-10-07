import type { Profile, ProfileUpdate } from '../types/profile'
import { apiClient, getAuthenticatedHeaders } from './api'

export const profileQueryKey = (userId: string) => ['profile', userId] as const

export async function getProfile(userId: string, signal?: AbortSignal): Promise<Profile> {
  const headers = await getAuthenticatedHeaders(userId)
  const { data } = await apiClient.get<Profile>('/api/v1/users/me/profile', {
    headers, signal, timeout: 15_000,
  })
  return data
}

export async function updateProfile(userId: string, changes: ProfileUpdate): Promise<Profile> {
  const headers = await getAuthenticatedHeaders(userId)
  const { data } = await apiClient.patch<Profile>('/api/v1/users/me/profile', changes, {
    headers, timeout: 15_000,
  })
  return data
}
