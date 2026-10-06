import { useHealthQuery } from '../../hooks/useHealthQuery'

const labels = { checking: 'Checking API', connected: 'API connected', unavailable: 'API unavailable' } as const
const dotStyles = { checking: 'bg-amber-400 animate-pulse', connected: 'bg-emerald-500', unavailable: 'bg-rose-500' } as const

export function StatusIndicator() {
  const { connectionState } = useHealthQuery()

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600" title="Careerly backend connection">
      <span className={`size-2 rounded-full ${dotStyles[connectionState]}`} />
      <span className="hidden sm:inline">{labels[connectionState]}</span>
      <span className="sm:hidden">API</span>
    </div>
  )
}

