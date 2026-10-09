import { useQuery } from '@tanstack/react-query'
import { BookmarkPlus, Plus, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { ErrorState, LoadingState } from '../components/common/WorkspaceUI'
import { DashboardContent } from '../components/dashboard/DashboardContent'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../services/api'
import { dashboardQueryKey, getDashboardSummary } from '../services/dashboard'
import { getLocalDate } from '../utils/calendar-date'

function DashboardWorkspace({ userId, firstName }: { userId: string; firstName: string }) {
  const [today, setToday] = useState(() => getLocalDate())
  useEffect(() => {
    const updateDate = () => setToday(getLocalDate())
    const interval = window.setInterval(updateDate, 60000)
    window.addEventListener('focus', updateDate)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', updateDate)
    }
  }, [])
  const query = useQuery({
    queryKey: [...dashboardQueryKey(userId), today],
    queryFn: ({ signal }) => getDashboardSummary(userId, today, signal),
    gcTime: 0,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
  })
  function refresh() {
    const currentDate = getLocalDate()
    if (currentDate !== today) setToday(currentDate)
    else void query.refetch()
  }
  return (
    <div className="page-stack workspace-page workspace-page--overview">
      <PageHeader
        eyebrow="Your career dashboard"
        title={`Welcome back, ${firstName}.`}
        description="Your opportunities, progress, and next steps. All in one place."
        action={
          <>
            <button
              type="button"
              onClick={refresh}
              disabled={query.isFetching}
              className="icon-button dashboard-refresh"
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
            >
              <RefreshCw size={14} className={query.isFetching ? 'animate-spin' : ''} />
            </button>
            <Link className="btn btn-secondary" to="/app/jobs?action=new">
              <BookmarkPlus size={16} />
              Save a job
            </Link>
            <Link className="btn btn-primary" to="/app/applications?action=new">
              <Plus size={16} />
              Track application
            </Link>
          </>
        }
      />
      {query.isPending && <LoadingState label="Loading your dashboard" />}
      {query.isError && (
        <ErrorState
          message={getApiErrorMessage(query.error)}
          retry={refresh}
          busy={query.isFetching}
          stale={Boolean(query.data)}
        />
      )}
      {query.data && <DashboardContent summary={query.data} />}
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null
  const fullName =
    typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : ''
  return (
    <DashboardWorkspace
      key={user.id}
      userId={user.id}
      firstName={fullName.trim().split(/\s+/)[0] || 'there'}
    />
  )
}
