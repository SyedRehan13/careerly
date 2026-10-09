import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Bookmark, ExternalLink, Lightbulb, MapPin, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspaceEditor } from '../../hooks/useWorkspaceEditor'

import { PageHeader } from '../common/PageHeader'
import { WorkspaceToolbar } from '../common/WorkspaceToolbar'
import { getApiErrorMessage } from '../../services/api'
import {
  deleteSavedJob,
  getSavedJobs,
  SAVED_JOBS_PAGE_SIZE,
  savedJobsQueryKey,
} from '../../services/saved-jobs'
import type { SavedJob } from '../../types/saved-job'
import { safeJobUrl } from '../../utils/job-url'
import { SavedJobForm } from './SavedJobForm'
import {
  CompanyMark,
  DeleteConfirmation,
  EmptyState,
  ErrorState,
  LoadingState,
  SuccessNotice,
} from '../common/WorkspaceUI'

export function SavedJobsWorkspace({ userId }: { userId: string }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [editor, setEditor] = useWorkspaceEditor<SavedJob>()
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
  const visibleJobs = jobs.filter((job) =>
    [job.title, job.company, job.location ?? '']
      .join(' ')
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  )
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
    const wasCreating = editor?.record === null
    setNotice(`${job.title} ${wasCreating ? 'saved' : 'updated'}.`)
    setSearch('')
    setEditor(null)
    if (wasCreating) setPage(0)
    await refreshJobs()
  }

  function openEditor(job: SavedJob | null) {
    setEditor({ record: job })
    setDeleteId(null)
    deletion.reset()
    setNotice('')
  }

  return (
    <div className="page-stack workspace-page workspace-page--saved-jobs">
      <PageHeader
        eyebrow="Your job shortlist"
        title="Your saved opportunities"
        description="Save interesting roles, compare the details, and decide where to apply next."
        action={
          <button
            type="button"
            disabled={editor !== null || deletion.isPending}
            onClick={() => openEditor(null)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Save a job
          </button>
        }
      />
      {notice && <SuccessNotice>{notice}</SuccessNotice>}
      {editor && (
        <SavedJobForm
          key={editor.record?.id ?? 'new'}
          userId={userId}
          job={editor.record}
          onSaved={saved}
          onCancel={() => setEditor(null)}
        />
      )}
      <WorkspaceToolbar
        title="Your shortlist"
        search={search}
        onSearch={setSearch}
        searchLabel="Search jobs on this page"
        description={query.isSuccess
            ? `${visibleJobs.length} ${visibleJobs.length === 1 ? 'opportunity' : 'opportunities'} on this page · Newest first`
            : 'Keep promising roles close, from any job board.'}
      />
      {query.isPending && <LoadingState label="Loading saved opportunities" />}
      {query.isError && (
        <ErrorState
          message={getApiErrorMessage(query.error)}
          retry={() => {
            void query.refetch()
          }}
          busy={query.isFetching}
          stale={Boolean(query.data)}
        />
      )}
      {query.isSuccess && visibleJobs.length === 0 && (
        <section className="panel">
          <EmptyState
            icon={search ? Search : Bookmark}
            title={
              search
                ? 'Nothing matched this time'
                : page === 0
                  ? 'Good things are worth saving'
                  : 'You have reached the end'
            }
            description={
              search
                ? 'Try a different title, company, or location. Search covers the jobs on this page.'
                : page === 0
                  ? 'Found an interesting role? Save its details here and build a shortlist that feels right for you.'
                  : 'Go back to revisit your saved opportunities.'
            }
            action={
              search ? (
                <button className="btn btn-secondary" type="button" onClick={() => setSearch('')}>
                  Clear search
                </button>
              ) : page > 0 ? (
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setPage(page - 1)}
                >
                  Previous page
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={editor !== null}
                  onClick={() => openEditor(null)}
                >
                  <Plus size={15} />
                  Save your first job
                </button>
              )
            }
          />
        </section>
      )}
      <div className="job-grid">
        {visibleJobs.map((job) => {
          const url = safeJobUrl(job.job_url)
          return (
            <article key={job.id} className="panel job-card">
              <div className="job-card-header">
                <CompanyMark name={job.company} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs muted mb-1">{job.company}</p>
                  <h2>{job.title}</h2>
                </div>
                <span className="saved-label"><Bookmark size={13} /> Saved</span>
              </div>
              {job.location && (
                <p className="job-meta">
                  <MapPin size={13} />
                  {job.location}
                </p>
              )}
              <p className="job-meta text-[11px]">
                Saved{' '}
                {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
                  new Date(job.created_at),
                )}
              </p>
              {job.description && (
                <details className="details">
                  <summary>About this opportunity</summary>
                  <p>{job.description}</p>
                </details>
              )}
              <div className="flex-1" />
              <div className="job-card-actions">
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-link">
                    View opportunity <ExternalLink size={13} />
                  </a>
                )}
                <button
                  type="button"
                  disabled={editor !== null || deletion.isPending}
                  onClick={() => openEditor(job)}
                  className="btn btn-secondary btn-small"
                  aria-label={`Edit ${job.title} at ${job.company}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={editor !== null || deletion.isPending}
                  onClick={() => {
                    setDeleteId(job.id)
                    deletion.reset()
                    setNotice('')
                  }}
                  className="btn btn-danger-ghost btn-small"
                  aria-label={`Delete ${job.title} at ${job.company}`}
                >
                  Delete
                </button>
              </div>
              {deleteId === job.id && (
                <DeleteConfirmation
                  title="this saved job"
                  pending={deletion.isPending}
                  error={deletion.isError ? getApiErrorMessage(deletion.error) : undefined}
                  onConfirm={() => deletion.mutate(job.id)}
                  onCancel={() => {
                    setDeleteId(null)
                    deletion.reset()
                  }}
                />
              )}
            </article>
          )
        })}
      </div>
      {query.isSuccess && jobs.length > 0 && (
        <aside className="workspace-tip">
          <span className="tip-icon"><Lightbulb size={20} /></span>
          <div><h2>Found a role worth going for?</h2><p>Once you apply, add it to your tracker to keep notes, status updates, and follow-ups together.</p></div>
          <Link className="text-link" to="/app/applications?action=new">Track an application <ArrowRight size={15} /></Link>
        </aside>
      )}
      {(page > 0 || hasNext) && (
        <nav aria-label="Saved job pages" className="pagination">
          <button
            type="button"
            disabled={page === 0 || query.isFetching || deletion.isPending || editor !== null}
            onClick={() => {
              setPage(page - 1)
              setSearch('')
              setDeleteId(null)
              setNotice('')
            }}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span>Page {page + 1}</span>
          <button
            type="button"
            disabled={!hasNext || query.isFetching || deletion.isPending || editor !== null}
            onClick={() => {
              setPage(page + 1)
              setSearch('')
              setDeleteId(null)
              setNotice('')
            }}
            className="btn btn-secondary"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  )
}
