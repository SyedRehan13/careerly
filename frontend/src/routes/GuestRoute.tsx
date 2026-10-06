import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function GuestRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">
        <LoaderCircle className="animate-spin" size={20} aria-label="Loading session" />
      </div>
    )
  }

  return user ? <Navigate to="/app" replace /> : <Outlet />
}

