export interface Profile {
  id: string
  full_name: string | null
  headline: string | null
  location: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export type ProfileUpdate = Pick<Profile, 'full_name' | 'headline' | 'location' | 'bio'>
