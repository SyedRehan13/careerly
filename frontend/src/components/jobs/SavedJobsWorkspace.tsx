import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bookmark, ExternalLink, MapPin, Plus } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '../common/PageHeader'
import { getApiErrorMessage } from '../../services/api'
import { deleteSavedJob, getSavedJobs, SAVED_JOBS_PAGE_SIZE, savedJobsQueryKey } from '../../services/saved-jobs'
import type { SavedJob } from '../../types/saved-job'
import { SavedJobForm } from './SavedJobForm'

function safeJobUrl(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

export function SavedJobsWorkspace({ userId }: { userId: string }) {
  const [page, setPage] = useState(0)
  const [editor, setEditor] = useState<{ job: SavedJob | null } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: [...savedJobsQueryKey(userId), page],
    queryFn: ({ signal }) => getSavedJobs(userId, page, signal),
    gcTime: 0,
    retry: false,
  })
  const jobs = query.data?.slice(0, SAVED_JOBS_PAGE_SIZE) ?? []
  const hasNext = (query.data?.length ?? 0) > SAVED_JOBS_PAGE_SIZE

  async function refreshJobs() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: savedJobsQueryKey(userId) }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId] }),
    ])
  }

  const deletion = useMutation({
    mutationFn: (jobId: string) => deleteSavedJob(userId, jobId),
    onSuccess: async () => {
      setDeleteId(null)
      setNotice('Job deleted.')
      if (page > 0 && jobs.length === 1) setPage(page - 1)
      await refreshJobs()
    },
  })

  async function saved(job: SavedJob) {
    const wasCreating = editor?.job === null
    setNotice(`${job.title} ${wasCreating ? 'saved' : 'updated'}.`)
    setEditor(null)
    if (wasCreating) setPage(0)
    await refreshJobs()
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Opportunities" title="Saved jobs" description="Keep promising opportunities organized in one place." action={
        <button type="button" disabled={editor !== null || deletion.isPending} onClick={() => { setEditor({ job: null }); setDeleteId(null); deletion.reset(); setNotice('') }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"><Plus size={18} />Save a job</button>
      } />
      {notice && <p role="status" className="text-sm font-semibold text-emerald-700">{notice}</p>}
      {editor && <SavedJobForm key={editor.job?.id ?? 'new'} userId={userId} job={editor.job} onSaved={saved} onCancel={() => setEditor(null)} />}
      {query.isPending && <p role="status" className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading saved jobs…</p>}
      {query.isError && (
        <div role="alert" className="space-y-3 rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-700">
          <p>{getApiErrorMessage(query.error)}</p>
          <button type="button" disabled={query.isFetching} onClick={() => { void query.refetch() }} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:opacity-50">{query.isFetching ? 'Retrying…' : 'Try again'}</button>
        </div>
      )}
      {query.isSuccess && jobs.length === 0 && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Bookmark className="mx-auto text-indigo-500" size={28} />
          <h2 className="mt-4 text-lg font-bold text-slate-950">{page === 0 ? 'No saved jobs yet' : 'No jobs on this page'}</h2>
          <p className="mt-2 text-sm text-slate-500">{page === 0 ? 'Use “Save a job” to add your first opportunity.' : 'Use Previous to return to your saved jobs.'}</p>
        </section>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {jobs.map((job) => {
          const url = safeJobUrl(job.job_url)
          const confirming = deleteId === job.id
          return (
            <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="break-words text-lg font-bold text-slate-950">{job.title}</h2>
              <p className="mt-1 break-words text-sm font-semibold text-slate-600">{job.company}</p>
              {job.location && <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><MapPin size={15} className="shrink-0" />{job.location}</p>}
              {job.description && <details className="mt-4 text-sm text-slate-600"><summary className="cursor-pointer font-semibold text-slate-700">Job description</summary><p className="mt-3 whitespace-pre-wrap break-words leading-6">{job.description}</p></details>}
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                {url && <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600">Open job <ExternalLink size={14} /></a>}
                <button type="button" disabled={editor !== null || deletion.isPending} onClick={() => { setEditor({ job }); setDeleteId(null); deletion.reset(); setNotice('') }} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50" aria-label={`Edit ${job.title} at ${job.company}`}>Edit</button>
                <button type="button" disabled={editor !== null || deletion.isPending} onClick={() => { setDeleteId(job.id); deletion.reset(); setNotice('') }} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50" aria-label={`Delete ${job.title} at ${job.company}`}>Delete</button>
              </div>
              {confirming && (
                <div className="mt-3 rounded-xl bg-red-50 p-4">
                  <p className="text-sm text-red-900">Delete this saved job? This cannot be undone.</p>
                  {deletion.isError && <p role="alert" className="mt-2 text-sm text-red-700">{getApiErrorMessage(deletion.error)}</p>}
                  <div className="mt-3 flex gap-3">
                    <button type="button" disabled={deletion.isPending} onClick={() => deletion.mutate(job.id)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">{deletion.isPending ? 'Deleting…' : 'Confirm delete'}</button>
                    <button type="button" disabled={deletion.isPending} onClick={() => { setDeleteId(null); deletion.reset() }} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">Cancel</button>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
      {(page > 0 || hasNext) && (
        <nav aria-label="Saved job pages" className="flex items-center justify-between gap-3">
          <button type="button" disabled={page === 0 || query.isFetching || deletion.isPending || editor !== null} onClick={() => { setPage(page - 1); setDeleteId(null); setNotice('') }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Previous</button>
          <span className="text-sm text-slate-500">Page {page + 1}</span>
          <button type="button" disabled={!hasNext || query.isFetching || deletion.isPending || editor !== null} onClick={() => { setPage(page + 1); setDeleteId(null); setNotice('') }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Next</button>
        </nav>
      )}
    </div>
  )
}
