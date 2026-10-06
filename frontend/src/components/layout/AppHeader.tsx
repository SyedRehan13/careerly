import { Bell, Menu, Search } from 'lucide-react'
import { StatusIndicator } from '../common/StatusIndicator'
import { useAuth } from '../../hooks/useAuth'

interface AppHeaderProps { onMenuClick: () => void }

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user } = useAuth()
  const fullName = typeof user?.user_metadata.full_name === 'string' ? user.user_metadata.full_name : ''
  const initials = fullName
    ? fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'ME'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-7">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={onMenuClick} aria-label="Open navigation" type="button"><Menu size={21} /></button>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400 md:flex">
          <Search size={16} /><span className="w-52 text-sm">Search Careerly</span><kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500">Ctrl K</kbd>
        </div>
        <StatusIndicator />
      </div>
      <div className="flex items-center gap-2.5">
        <button className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100" aria-label="Notifications" type="button"><Bell size={19} /></button>
        <div className="grid size-9 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700" title={fullName || user?.email || 'Your profile'}>{initials}</div>
      </div>
    </header>
  )
}

