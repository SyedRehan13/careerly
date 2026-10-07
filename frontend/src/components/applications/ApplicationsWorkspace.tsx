import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, ExternalLink, Plus } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '../common/PageHeader'
import { getApiErrorMessage } from '../../services/api'
import { applicationsQueryKey, APPLICATIONS_PAGE_SIZE, deleteApplication, getApplications } from '../../services/applications'
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS, isApplicationStatus } from '../../types/application'
import type { Application, ApplicationStatus } from '../../types/application'
import { safeJobUrl } from '../../utils/job-url'
import { ApplicationForm } from './ApplicationForm'

const statusStyles: Record<ApplicationStatus, string> = {
  applied: 'bg-indigo-50 text-indigo-700', interviewing: 'bg-amber-50 text-amber-800',
  offer: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-700', withdrawn: 'bg-slate-100 text-slate-600',
}

function displayDate(value: string): string {
  // These are calendar dates, not UTC timestamps.
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export function ApplicationsWorkspace({ userId }: { userId: string }) {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all')
  const [editor, setEditor] = useState<{ application: Application | null } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: [...applicationsQueryKey(userId), filter, page],
    queryFn: ({ signal }) => getApplications(userId, page, filter === 'all' ? null : filter, signal),
    gcTime: 0, retry: false,
  })
  const applications = query.data?.slice(0, APPLICATIONS_PAGE_SIZE) ?? []
  const hasNext = (query.data?.length ?? 0) > APPLICATIONS_PAGE_SIZE

  async function refreshApplications() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey(userId) }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId] }),
    ])
  }

  const deletion = useMutation({
    mutationFn: (id: string) => deleteApplication(userId, id),
    onSuccess: async () => {
      setDeleteId(null)
      setNotice('Application deleted.')
      if (page > 0 && applications.length === 1) setPage(page - 1)
      await refreshApplications()
    },
  })

  async function saved(application: Application) {
    const creating = editor?.application === null
    setNotice(`${application.title} ${creating ? 'added' : 'updated'}.`)
    setEditor(null)
    if (filter !== 'all' && filter !== application.status) {
      setFilter(application.status)
      setPage(0)
    } else if (creating) {
      setPage(0)
    }
    await refreshApplications()
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Track" title="Applications" description="Track your progress, follow-ups, and next steps for each role." action={
        <button type="button" disabled={editor !== null || deletion.isPending} onClick={() => { setEditor({ application: null }); setDeleteId(null); deletion.reset(); setNotice('') }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"><Plus size={18} />Add application</button>
      } />
      {notice && <p role="status" className="text-sm font-semibold text-emerald-700">{notice}</p>}
      {editor && <ApplicationForm key={editor.application?.id ?? 'new'} userId={userId} application={editor.application} onSaved={saved} onCancel={() => setEditor(null)} />}
      <label htmlFor="application-filter" className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700">Filter by status
        <select id="application-filter" value={filter} disabled={editor !== null || deletion.isPending} onChange={(event) => {
          const value = event.target.value
          if (value === 'all' || isApplicationStatus(value)) { setFilter(value); setPage(0); setDeleteId(null); setNotice(''); deletion.reset() }
        }} className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-normal disabled:opacity-50">
          <option value="all">All statuses</option>
          {APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{APPLICATION_STATUS_LABELS[status]}</option>)}
        </select>
      </label>
      {query.isPending && <p role="status" className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading applications…</p>}
      {query.isError && (
        <div role="alert" className="space-y-3 rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-700">
          <p>{getApiErrorMessage(query.error)}</p>
          <button type="button" disabled={query.isFetching} onClick={() => { void query.refetch() }} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:opacity-50">{query.isFetching ? 'Retrying…' : 'Try again'}</button>
        </div>
      )}
      {query.isSuccess && applications.length === 0 && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <ClipboardList className="mx-auto text-indigo-500" size={28} />
          <h2 className="mt-4 text-lg font-bold text-slate-950">{page > 0 ? 'No applications on this page' : filter === 'all' ? 'No applications yet' : `No ${APPLICATION_STATUS_LABELS[filter].toLowerCase()} applications`}</h2>
          <p className="mt-2 text-sm text-slate-500">{page > 0 ? 'Use Previous to return to your applications.' : filter === 'all' ? 'Add your first application to start tracking your progress.' : 'Choose All statuses to see your other applications.'}</p>
        </section>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {applications.map((application) => {
          const url = safeJobUrl(application.job_url)
          return (
            <article key={application.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0"><h2 className="break-words text-lg font-bold text-slate-950">{application.title}</h2><p className="mt-1 break-words text-sm font-semibold text-slate-600">{application.company}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[application.status]}`}>{APPLICATION_STATUS_LABELS[application.status]}</span>
              </div>
              {application.location && <p className="mt-3 text-sm text-slate-500">{application.location}</p>}
              <dl className="mt-4 flex flex-wrap gap-5 text-sm">
                <div><dt className="text-xs text-slate-500">Applied</dt><dd className="mt-1 font-medium text-slate-700">{application.applied_date ? displayDate(application.applied_date) : 'Not recorded'}</dd></div>
                <div><dt className="text-xs text-slate-500">Follow-up</dt><dd className="mt-1 font-medium text-slate-700">{application.follow_up_date ? displayDate(application.follow_up_date) : 'Not set'}</dd></div>
              </dl>
              {application.notes && <details className="mt-4 text-sm text-slate-600"><summary className="cursor-pointer font-semibold text-slate-700">Notes</summary><p className="mt-3 whitespace-pre-wrap break-words leading-6">{application.notes}</p></details>}
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                {url && <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600">Open job <ExternalLink size={14} /></a>}
                <button type="button" disabled={editor !== null || deletion.isPending} onClick={() => { setEditor({ application }); setDeleteId(null); deletion.reset(); setNotice('') }} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50" aria-label={`Edit application for ${application.title} at ${application.company}`}>Edit</button>
                <button type="button" disabled={editor !== null || deletion.isPending} onClick={() => { setDeleteId(application.id); deletion.reset(); setNotice('') }} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50" aria-label={`Delete application for ${application.title} at ${application.company}`}>Delete</button>
              </div>
              {deleteId === application.id && (
                <div className="mt-3 rounded-xl bg-red-50 p-4">
                  <p className="text-sm text-red-900">Delete this application? This cannot be undone.</p>
                  {deletion.isError && <p role="alert" className="mt-2 text-sm text-red-700">{getApiErrorMessage(deletion.error)}</p>}
                  <div className="mt-3 flex gap-3">
                    <button type="button" disabled={deletion.isPending} onClick={() => deletion.mutate(application.id)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">{deletion.isPending ? 'Deleting…' : 'Confirm delete'}</button>
                    <button type="button" disabled={deletion.isPending} onClick={() => { setDeleteId(null); deletion.reset() }} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">Cancel</button>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
      {(page > 0 || hasNext) && (
        <nav aria-label="Application pages" className="flex items-center justify-between gap-3">
          <button type="button" disabled={page === 0 || query.isFetching || deletion.isPending || editor !== null} onClick={() => { setPage(page - 1); setDeleteId(null); setNotice('') }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Previous</button>
          <span className="text-sm text-slate-500">Page {page + 1}</span>
          <button type="button" disabled={!hasNext || query.isFetching || deletion.isPending || editor !== null} onClick={() => { setPage(page + 1); setDeleteId(null); setNotice('') }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Next</button>
        </nav>
      )}
    </div>
  )
}
