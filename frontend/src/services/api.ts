import axios from 'axios'
import { supabase } from '../lib/supabase'
import type { HealthResponse } from '../types/api'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000',
  timeout: 5_000,
  headers: { Accept: 'application/json' },
})

export async function getAuthenticatedHeaders(userId: string) {
  if (!supabase) throw new Error('Please sign in to continue.')
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!data.session || data.session.user.id !== userId) {
    throw new Error('Your session changed. Please sign in again.')
  }
  return { Authorization: `Bearer ${data.session.access_token}` }
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ detail?: unknown }>(error)) {
    if (error.response?.status === 401) return 'Your session has expired. Please sign in again.'
    if (!error.response) return 'Unable to reach the server. Please try again shortly.'
    if (error.response.status === 422) return 'Please check your profile details and try again.'
    if (error.response.status >= 500) return 'The server could not complete your request. Please try again.'
    if (typeof error.response.data?.detail === 'string') return error.response.data.detail
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/health')
  return data
}

