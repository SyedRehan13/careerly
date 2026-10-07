export interface SavedJob {
  id: string
  user_id: string
  title: string
  company: string
  location: string | null
  job_url: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export type SavedJobInput = Pick<SavedJob, 'title' | 'company' | 'location' | 'job_url' | 'description'>
