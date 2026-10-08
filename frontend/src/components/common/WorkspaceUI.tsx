import type { LucideIcon } from 'lucide-react'
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { APPLICATION_STATUS_LABELS } from '../../types/application'
import type { ApplicationStatus } from '../../types/application'

export function CompanyMark({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
  return (
    <span className="company-mark" aria-hidden="true">
      {initials || 'C'}
    </span>
  )
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-dot" />
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={23} strokeWidth={1.5} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  )
}

export function LoadingState({ label = 'Loading your workspace' }: { label?: string }) {
  return (
    <div role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="loading-grid" aria-hidden="true">
        {[0, 1].map((key) => (
          <div className="panel loading-card" key={key}>
            <div className="skeleton h-10 w-10 mb-5" />
            <div className="skeleton h-4 w-2/3 mb-3" />
            <div className="skeleton h-3 w-1/2 mb-6" />
            <div className="skeleton h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ErrorState({
  message,
  retry,
  busy,
  stale = false,
}: {
  message: string
  retry: () => void
  busy: boolean
  stale?: boolean
}) {
  return (
    <div className="notice notice-error" role="alert">
      <AlertCircle size={18} />
      <div className="flex-1">
        <p>{message}</p>
        {stale && <p className="mt-1 text-xs">Showing the last loaded information.</p>}
        <button
          type="button"
          className="btn btn-secondary btn-small mt-3"
          disabled={busy}
          onClick={retry}
        >
          <RefreshCw size={13} />
          {busy ? 'Retrying…' : 'Try again'}
        </button>
      </div>
    </div>
  )
}

export function SuccessNotice({ children }: { children: ReactNode }) {
  return (
    <p className="notice" role="status">
      <CheckCircle2 size={17} />
      {children}
    </p>
  )
}

export function DeleteConfirmation({
  title,
  pending,
  error,
  onConfirm,
  onCancel,
}: {
  title: string
  pending: boolean
  error?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="delete-confirmation">
      <p>Delete {title}? This cannot be undone.</p>
      {error && (
        <p role="alert" className="mt-2">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          className="btn btn-danger btn-small"
          type="button"
          disabled={pending}
          onClick={onConfirm}
        >
          {pending ? 'Deleting…' : 'Confirm delete'}
        </button>
        <button
          className="btn btn-secondary btn-small"
          type="button"
          disabled={pending}
          onClick={onCancel}
          autoFocus
        >
          Keep it
        </button>
      </div>
    </div>
  )
}
