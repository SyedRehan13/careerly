export const APPLICATION_STATUSES = ['applied', 'interviewing', 'offer', 'rejected', 'withdrawn'] as const
export type ApplicationStatus = typeof APPLICATION_STATUSES[number]

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied', interviewing: 'Interviewing', offer: 'Offer',
  rejected: 'Rejected', withdrawn: 'Withdrawn',
}

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return APPLICATION_STATUSES.some((status) => status === value)
}

export interface Application {
  id: string
  user_id: string
  title: string
  company: string
  location: string | null
  job_url: string | null
  status: ApplicationStatus
  applied_date: string | null
  follow_up_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ApplicationInput = Pick<Application, 'title' | 'company' | 'location' | 'job_url' | 'status' | 'applied_date' | 'follow_up_date' | 'notes'>
