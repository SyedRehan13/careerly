import { BriefcaseBusiness } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BrandProps {
  compact?: boolean
  to?: string
}

export function Brand({ compact = false, to = '/' }: BrandProps) {
  return (
    <Link className="inline-flex items-center gap-2.5" to={to} aria-label="Careerly home">
      <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
        <BriefcaseBusiness size={18} strokeWidth={2.4} />
      </span>
      {!compact && <span className="text-xl font-bold tracking-tight text-slate-950">Careerly</span>}
    </Link>
  )
}

