import { ApplicationsWorkspace } from '../components/applications/ApplicationsWorkspace'
import { useAuth } from '../hooks/useAuth'

export function ApplicationsPage() {
  const { user } = useAuth()
  return user ? <ApplicationsWorkspace key={user.id} userId={user.id} /> : null
}

