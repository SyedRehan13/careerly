import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, ExternalLink, MapPin, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useWorkspaceEditor } from '../../hooks/useWorkspaceEditor'

import { PageHeader } from '../common/PageHeader'
import { WorkspaceToolbar } from '../common/WorkspaceToolbar'
import { getApiErrorMessage } from '../../services/api'
import {
  applicationsQueryKey,
  APPLICATIONS_PAGE_SIZE,
  deleteApplication,
  getApplications,
} from '../../services/applications'
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS, isApplicationStatus } from '../../types/application'
import type { Application, ApplicationStatus } from '../../types/application'
import { safeJobUrl } from '../../utils/job-url'
import { ApplicationForm } from './ApplicationForm'
import {
  CompanyMark,
  DeleteConfirmation,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
  SuccessNotice,
} from '../common/WorkspaceUI'
import { formatCalendarDate } from '../../utils/calendar-date'

export function ApplicationsWorkspace({ userId }: { userId: string }) {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status') ?? ''
  const filter = isApplicationStatus(statusParam) ? statusParam : 'all'
  const [editor, setEditor] = useWorkspaceEditor<Application>()

  function setFilter(value: ApplicationStatus | 'all') {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (value === 'all') next.delete('status')
      else next.set('status', value)
      next.delete('action')
      return next
    }, { replace: true })
  }
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: [...applicationsQueryKey(userId), filter, page],
    queryFn: ({ signal }) =>
      getApplications(userId, page, filter === 'all' ? null : filter, signal),
    gcTime: 0,
    retry: false,
  })
  const applications = query.data?.slice(0, APPLICATIONS_PAGE_SIZE) ?? []
  const visibleApplications = applications.filter((application) =>
    [application.title, application.company, application.location ?? '']
      .join(' ')
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  )
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
    setSearch('')
    const creating = editor?.record === null
    setNotice(`${application.title} ${creating ? 'added' : 'updated'}.`)
    const changedStatus = filter !== 'all' && filter !== application.status
    // Close the form and follow a changed status in one navigation.
    setEditor(null, changedStatus ? { status: application.status } : {})
    if (changedStatus || creating) setPage(0)
    await refreshApplications()
  }

  function changeFilter(value: ApplicationStatus | 'all') {
    setSearch('')
    setFilter(value)
    setPage(0)
    setDeleteId(null)
    setNotice('')
    deletion.reset()
  }

  function openEditor(application: Application | null) {
    setEditor({ record: application })
    setDeleteId(null)
    deletion.reset()
    setNotice('')
  }

  return (
    <div className="page-stack workspace-page workspace-page--applications">
      <PageHeader
        eyebrow="Application tracker"
        title="Your applications"
        description="Track each stage, keep useful notes, and stay on top of your follow-ups."
        action={
          <button
            type="button"
            disabled={editor !== null || deletion.isPending}
            onClick={() => openEditor(null)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add application
          </button>
        }
      />
      {notice && <SuccessNotice>{notice}</SuccessNotice>}
      {editor && (
        <ApplicationForm
          key={editor.record?.id ?? 'new'}
          userId={userId}
          application={editor.record}
          onSaved={saved}
          onCancel={() => setEditor(null)}
        />
      )}
      <WorkspaceToolbar
        title="Application overview"
        description={query.isSuccess
          ? `${visibleApplications.length} ${visibleApplications.length === 1 ? 'application' : 'applications'} on this page · Newest first`
          : 'Every stage of your job search, in one place.'}
        search={search}
        onSearch={setSearch}
        searchLabel="Search applications on this page"
      >
        <div className="filter-tabs" role="group" aria-label="Filter applications by status">
          <button
            className="filter-tab"
            type="button"
            aria-pressed={filter === 'all'}
            disabled={editor !== null || deletion.isPending}
            onClick={() => changeFilter('all')}
          >
            All applications
          </button>
          {APPLICATION_STATUSES.map((status) => (
            <button
              type="button"
              className="filter-tab"
              key={status}
              aria-pressed={filter === status}
              disabled={editor !== null || deletion.isPending}
              onClick={() => changeFilter(status)}
            >
              <span className={`legend-dot pipeline-${status}`} />
              {APPLICATION_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </WorkspaceToolbar>
      {query.isPending && <LoadingState label="Loading your applications" />}
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
      {query.isSuccess && visibleApplications.length === 0 && (
        <section className="panel">
          <EmptyState
            icon={search ? Search : ClipboardList}
            title={
              search ? 'No matching applications' : page > 0
                ? 'Nothing else on this page'
                : filter === 'all'
                  ? 'Every journey has a first step'
                  : `No ${APPLICATION_STATUS_LABELS[filter].toLowerCase()} applications yet`
            }
            description={
              search ? 'Try another title, company, or location. Search covers the current page and selected stage.' : page > 0
                ? 'Head back to see the applications you are tracking.'
                : filter === 'all'
                  ? 'Applied for something promising? Add the role, keep your notes together, and see where it takes you.'
                  : 'Your other applications are waiting in the full list.'
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
              ) : filter !== 'all' ? (
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => changeFilter('all')}
                >
                  View all applications
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={editor !== null}
                  onClick={() => openEditor(null)}
                >
                  <Plus size={15} />
                  Add your first application
                </button>
              )
            }
          />
        </section>
      )}
      <div className="job-grid">
        {visibleApplications.map((application) => {
          const url = safeJobUrl(application.job_url)
          return (
            <article key={application.id} className="panel job-card">
              <div className="job-card-header">
                <CompanyMark name={application.company} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs muted mb-1">{application.company}</p>
                  <h2>{application.title}</h2>
                </div>
                <StatusBadge status={application.status} />
              </div>
              {application.location && (
                <p className="job-meta">
                  <MapPin size={13} />
                  {application.location}
                </p>
              )}
              <dl className="application-dates">
                <div>
                  <dt>Applied</dt>
                  <dd>
                    {application.applied_date
                      ? formatCalendarDate(application.applied_date)
                      : 'Not recorded'}
                  </dd>
                </div>
                <div>
                  <dt>Next follow-up</dt>
                  <dd>
                    {application.follow_up_date
                      ? formatCalendarDate(application.follow_up_date)
                      : 'Not planned yet'}
                  </dd>
                </div>
              </dl>
              {application.notes && (
                <details className="details">
                  <summary>Your notes</summary>
                  <p>{application.notes}</p>
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
                  onClick={() => openEditor(application)}
                  className="btn btn-secondary btn-small"
                  aria-label={`Edit application for ${application.title} at ${application.company}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={editor !== null || deletion.isPending}
                  onClick={() => {
                    setDeleteId(application.id)
                    deletion.reset()
                    setNotice('')
                  }}
                  className="btn btn-danger-ghost btn-small"
                  aria-label={`Delete application for ${application.title} at ${application.company}`}
                >
                  Delete
                </button>
              </div>
              {deleteId === application.id && (
                <DeleteConfirmation
                  title="this application"
                  pending={deletion.isPending}
                  error={deletion.isError ? getApiErrorMessage(deletion.error) : undefined}
                  onConfirm={() => deletion.mutate(application.id)}
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
      {(page > 0 || hasNext) && (
        <nav aria-label="Application pages" className="pagination">
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
