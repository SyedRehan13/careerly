export interface ResumeExperience {
  id: string
  role: string
  company: string
  location: string
  start_date: string
  end_date: string
  description: string
}

export interface ResumeEducation {
  id: string
  institution: string
  qualification: string
  field_of_study: string
  start_date: string
  end_date: string
  description: string
}

export interface ResumeContent {
  full_name: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  summary: string
  skills: string[]
  experience: ResumeExperience[]
  education: ResumeEducation[]
}

export interface ResumeResponse {
  user_id: string
  content: ResumeContent
  updated_at: string | null
}
