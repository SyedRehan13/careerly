import { ChevronRight, Menu } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const titles: Record<string, string> = {
  '/app': 'Overview',
  '/app/jobs': 'Saved jobs',
  '/app/applications': 'Applications',
  '/app/resume': 'Resume',
  '/app/interview': 'Interview prep',
  '/app/profile': 'Your profile',
}

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const fullName =
    typeof user?.user_metadata.full_name === 'string' ? user.user_metadata.full_name.trim() : ''
  const initials = fullName
    ? fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'ME'
  return (
    <header className="app-header">
      <div className="flex items-center gap-2">
        <button
          className="icon-button mobile-menu"
          onClick={onMenuClick}
          aria-label="Open navigation"
          type="button"
        >
          <Menu size={20} />
        </button>
        <div className="breadcrumb">
          <span>Workspace</span>
          <ChevronRight size={12} />
          <strong>{titles[pathname] ?? 'Careerly'}</strong>
        </div>
      </div>
      <div className="header-right">
        <span className="header-date">
          {new Intl.DateTimeFormat(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }).format(new Date())}
        </span>
        <Link
          to="/app/profile"
          className="avatar profile-trigger"
          aria-label="Open your profile"
          aria-current={pathname === '/app/profile' ? 'page' : undefined}
          title="Open your profile"
        >
          <span>{initials}</span>
        </Link>
      </div>
    </header>
  )
}
