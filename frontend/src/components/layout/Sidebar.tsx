import { Briefcase, ClipboardList, FileText, LayoutDashboard, LogOut, MessagesSquare, UserRound, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Brand } from '../common/Brand'
import { useAuth } from '../../hooks/useAuth'

const navigation = [
  { label: 'Dashboard', to: '/app', icon: LayoutDashboard, end: true },
  { label: 'Jobs', to: '/app/jobs', icon: Briefcase, end: false },
  { label: 'Applications', to: '/app/applications', icon: ClipboardList, end: false },
  { label: 'Resume', to: '/app/resume', icon: FileText, end: false },
  { label: 'Interview Prep', to: '/app/interview', icon: MessagesSquare, end: false },
  { label: 'Profile', to: '/app/profile', icon: UserRound, end: false },
] as const

interface SidebarProps { open: boolean; onClose: () => void }

export function Sidebar({ open, onClose }: SidebarProps) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const fullName = typeof user?.user_metadata.full_name === 'string' ? user.user_metadata.full_name : 'Careerly member'

  async function handleSignOut() {
    await signOut()
    onClose()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {open && <button className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px] lg:hidden" onClick={onClose} aria-label="Close navigation" type="button" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <Brand to="/app" />
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={onClose} aria-label="Close navigation" type="button"><X size={20} /></button>
        </div>
        <nav className="mt-9 flex-1 space-y-1" aria-label="Application navigation">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>
              <Icon size={19} strokeWidth={1.9} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 pt-4">
          <div className="px-3 pb-3"><p className="truncate text-sm font-bold text-slate-900">{fullName}</p><p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p></div>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => void handleSignOut()} type="button"><LogOut size={18} />Log out</button>
        </div>
      </aside>
    </>
  )
}
