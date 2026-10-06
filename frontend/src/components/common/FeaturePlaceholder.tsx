import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from './PageHeader'

interface FeaturePlaceholderProps {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  panelTitle: string
  panelDescription: string
  actionLabel: string
}

export function FeaturePlaceholder({ icon: Icon, eyebrow, title, description, panelTitle, panelDescription, actionLabel }: FeaturePlaceholderProps) {
  return (
    <div className="space-y-7">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <section className="grid min-h-[430px] place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm shadow-slate-200/40">
        <div className="max-w-md">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Icon size={25} /></span>
          <h2 className="mt-5 text-xl font-bold text-slate-950">{panelTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{panelDescription}</p>
          <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800" type="button">{actionLabel}<ArrowRight size={16} /></button>
          <p className="mt-4 text-xs text-slate-400">Available in the next product phase</p>
        </div>
      </section>
    </div>
  )
}

