import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, CalendarDays, ClipboardList, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../services/api'
import { dashboardQueryKey, getDashboardSummary } from '../services/dashboard'
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS } from '../types/application'
import type { DashboardSummary } from '../types/dashboard'
import { formatCalendarDate, getLocalDate } from '../utils/calendar-date'

function DashboardContent({ summary }: { summary: DashboardSummary }) {
  const metrics = [
    { label: 'Active applications', value: summary.active_applications, detail: 'Applied, interviewing, or offer', tone: 'bg-indigo-500' },
    { label: 'Interviewing', value: summary.applications_by_status.interviewing, detail: 'Applications at the interview stage', tone: 'bg-amber-500' },
    { label: 'Saved jobs', value: summary.saved_jobs_count, detail: 'Opportunities you have saved', tone: 'bg-violet-500' },
    { label: 'Offers', value: summary.applications_by_status.offer, detail: 'Applications with an offer', tone: 'bg-emerald-500' },
  ]
  const nextAction = summary.upcoming_follow_ups.length > 0
    ? 'Review your upcoming follow-ups'
    : summary.total_applications > 0
      ? 'Keep your applications up to date'
      : summary.saved_jobs_count > 0
        ? 'Start tracking an application'
        : 'Save your first opportunity'

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Job search summary">
        {metrics.map((metric) => (
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={metric.label}>
            <div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{metric.label}</p><span className={`size-2 rounded-full ${metric.tone}`} /></div>
            <p className="mt-4 text-3xl font-bold text-slate-950">{metric.value}</p>
            <p className="mt-2 text-xs text-slate-500">{metric.detail}</p>
          </article>
        ))}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-label="Application status overview">
        <h2 className="font-bold text-slate-950">Application status overview</h2>
        <p className="mt-1 text-sm text-slate-500">{summary.total_applications} total applications</p>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {APPLICATION_STATUSES.map((status) => <div key={status}><dt className="text-xs text-slate-500">{APPLICATION_STATUS_LABELS[status]}</dt><dd className="mt-1 text-xl font-bold text-slate-900">{summary.applications_by_status[status]}</dd></div>)}
        </dl>
      </section>
      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="font-bold text-slate-950">Recent applications</h2><Link className="text-sm font-bold text-indigo-600" to="/app/applications">View all</Link></div>
          {summary.recent_applications.length === 0 ? (
            <div className="p-6 text-sm text-slate-500"><p>No applications yet.</p><Link className="mt-2 inline-block font-semibold text-indigo-600" to="/app/applications">Add your first application</Link></div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {summary.recent_applications.map((application) => (
                <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6" key={application.id}>
                  <div className="min-w-0"><p className="break-words text-sm font-bold text-slate-900">{application.title}</p><p className="text-xs text-slate-500">{application.company}</p></div>
                  <div className="text-right"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{APPLICATION_STATUS_LABELS[application.status]}</span><p className="mt-2 text-xs text-slate-500">{application.applied_date ? `Applied ${formatCalendarDate(application.applied_date)}` : `Added ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(application.created_at))}`}</p></div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2"><CalendarDays className="text-indigo-600" size={18} /><h2 className="font-bold text-slate-950">Upcoming follow-ups</h2></div>
          <p className="mt-2 text-xs text-slate-500">Active applications due {formatCalendarDate(summary.as_of_date)} or later</p>
          {summary.upcoming_follow_ups.length === 0 ? <p className="mt-5 text-sm text-slate-500">No upcoming follow-ups. Set a follow-up date on an active application to see it here.</p> : (
            <ul className="mt-5 space-y-3">{summary.upcoming_follow_ups.map((application) => (
              <li className="rounded-xl border border-slate-100 bg-slate-50 p-4" key={application.id}>
                <p className="text-sm font-bold text-slate-900">{application.company}</p><p className="mt-1 text-xs text-slate-500">{application.title} · {APPLICATION_STATUS_LABELS[application.status]}</p>
                <p className="mt-3 text-xs font-semibold text-indigo-700">{application.follow_up_date && formatCalendarDate(application.follow_up_date)}</p>
              </li>
            ))}</ul>
          )}
        </section>
      </div>
      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-slate-950 p-6 text-white">
        <div className="flex items-center gap-3"><ClipboardList size={22} className="shrink-0 text-indigo-300" /><div><p className="text-xs text-indigo-300">Next step</p><h2 className="mt-1 text-xl font-bold">{nextAction}</h2></div></div>
        <div className="flex gap-3"><Link className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold hover:bg-indigo-400" to={summary.total_applications > 0 || summary.saved_jobs_count > 0 ? '/app/applications' : '/app/jobs'}>Open workspace</Link><Link className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/15" to="/app/profile">Update profile</Link></div>
      </section>
    </>
  )
}

function DashboardWorkspace({ userId, firstName }: { userId: string; firstName: string }) {
  const [today, setToday] = useState(() => getLocalDate())
  useEffect(() => {
    const updateDate = () => setToday(getLocalDate())
    const interval = window.setInterval(updateDate, 60000)
    window.addEventListener('focus', updateDate)
    return () => { window.clearInterval(interval); window.removeEventListener('focus', updateDate) }
  }, [])
  const query = useQuery({
    queryKey: [...dashboardQueryKey(userId), today],
    queryFn: ({ signal }) => getDashboardSummary(userId, today, signal),
    gcTime: 0, staleTime: 0, retry: false, refetchOnWindowFocus: true,
  })
  function refresh() {
    const currentDate = getLocalDate()
    if (currentDate !== today) setToday(currentDate)
    else void query.refetch()
  }
  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Your workspace" title={`Welcome, ${firstName}`} description="Your saved jobs, application progress, and upcoming follow-ups." action={<Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700" to="/app/jobs">Saved jobs <ArrowUpRight size={16} /></Link>} />
      <button type="button" onClick={refresh} disabled={query.isFetching} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 disabled:opacity-50"><RefreshCw size={16} />{query.isFetching ? 'Refreshing dashboard…' : 'Refresh dashboard'}</button>
      {query.isPending && <p role="status" className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading your dashboard…</p>}
      {query.isError && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p>{getApiErrorMessage(query.error)}</p><p className="mt-1">{query.data ? 'The last loaded data is shown below. Use Refresh dashboard to retry.' : 'Use Refresh dashboard to retry.'}</p></div>}
      {query.data && <DashboardContent summary={query.data} />}
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null
  const fullName = typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : ''
  return <DashboardWorkspace key={user.id} userId={user.id} firstName={fullName.trim().split(/\s+/)[0] || 'there'} />
}
