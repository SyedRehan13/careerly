import type { Application, ApplicationStatus } from './application'

export interface DashboardSummary {
  as_of_date: string
  saved_jobs_count: number
  total_applications: number
  active_applications: number
  applications_by_status: Record<ApplicationStatus, number>
  recent_applications: Application[]
  upcoming_follow_ups: Application[]
}
