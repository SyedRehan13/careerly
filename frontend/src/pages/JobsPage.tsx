import { SavedJobsWorkspace } from '../components/jobs/SavedJobsWorkspace'
import { useAuth } from '../hooks/useAuth'

export function JobsPage() {
  const { user } = useAuth()
  return user ? <SavedJobsWorkspace key={user.id} userId={user.id} /> : null
}

