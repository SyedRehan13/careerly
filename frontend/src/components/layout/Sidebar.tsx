import {
  Bookmark,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Brand } from '../common/Brand'
import { useAuth } from '../../hooks/useAuth'

const groups = [
  {
    title: 'Workspace',
    items: [
      { label: 'Overview', to: '/app', icon: LayoutDashboard, soon: false },
      { label: 'Applications', to: '/app/applications', icon: ClipboardList, soon: false },
      { label: 'Saved jobs', to: '/app/jobs', icon: Bookmark, soon: false },
    ],
  },
  {
    title: 'Career tools',
    items: [
      { label: 'Resume', to: '/app/resume', icon: FileText, soon: true },
      { label: 'Interview prep', to: '/app/interview', icon: MessagesSquare, soon: true },
    ],
  },
  {
    title: 'Personal',
    items: [{ label: 'Your profile', to: '/app/profile', icon: UserRound, soon: false }],
  },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState('')
  const fullName =
    typeof user?.user_metadata.full_name === 'string' && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : 'Careerly member'
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!open) {
      dialog?.close()
      return
    }
    const trigger = document.activeElement
    dialog?.showModal()
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const wide = window.matchMedia('(min-width: 1024px)')
    const closeOnWide = () => {
      if (wide.matches) onClose()
    }
    wide.addEventListener('change', closeOnWide)
    return () => {
      dialog?.close()
      document.body.style.overflow = originalOverflow
      wide.removeEventListener('change', closeOnWide)
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus()
    }
  }, [open, onClose])

  async function handleSignOut() {
    setError('')
    setIsSigningOut(true)
    try {
      await signOut()
      onClose()
      navigate('/login', { replace: true })
    } catch {
      setError('Could not log out. Please try again.')
    } finally {
      setIsSigningOut(false)
    }
  }

  function content(mobile: boolean) {
    return (
      <>
        <div className="sidebar-brand flex items-center justify-between">
          <Brand to="/app" />
          {mobile && (
            <button
              className="icon-button"
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
            >
              <X size={19} />
            </button>
          )}
        </div>
        <nav aria-label={mobile ? 'Mobile navigation' : 'Main navigation'}>
          {groups.map((group) => (
            <div className="nav-group" key={group.title}>
              <p className="nav-label">{group.title}</p>
              {group.items.map(({ label, to, icon: Icon, soon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/app'}
                  onClick={onClose}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} strokeWidth={1.7} />
                  {label}
                  {soon && <span className="soon-tag">Soon</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        {error && (
          <p className="notice notice-error text-xs mb-2" role="alert">
            {error}
          </p>
        )}
        <div className="account-area">
          <Link className="account-link" to="/app/profile" onClick={onClose}>
            <span className="avatar">{initials}</span>
            <div className="min-w-0">
              <p className="account-name">{fullName}</p>
              <p className="account-email">{user?.email}</p>
            </div>
          </Link>
          <button
            className="icon-button"
            onClick={() => void handleSignOut()}
            type="button"
            disabled={isSigningOut}
            aria-label={isSigningOut ? 'Logging out' : 'Log out'}
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </>
    )
  }
  return (
    <>
      <aside className="sidebar desktop-sidebar">{content(false)}</aside>
      <dialog
        className="mobile-drawer"
        ref={dialogRef}
        aria-label="Careerly navigation"
        onCancel={(event) => {
          event.preventDefault()
          onClose()
        }}
        onClick={(event) => {
          if (
            event.target === event.currentTarget &&
            event.clientX >= event.currentTarget.getBoundingClientRect().right
          )
            onClose()
        }}
      >
        <div className="sidebar">{content(true)}</div>
      </dialog>
    </>
  )
}
