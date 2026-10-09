import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function GuestRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--canvas)]">
        <span role="status" className="flex gap-3 items-center text-sm muted">
          <LoaderCircle className="animate-spin text-brand-600" size={20} />
          Opening Careerly…
        </span>
      </div>
    )
  }

  return user ? <Navigate to="/app" replace /> : <Outlet />
}
