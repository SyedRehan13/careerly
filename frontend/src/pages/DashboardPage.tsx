import { ArrowUpRight, CalendarDays, ChevronRight, CircleCheckBig, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { recentApplications, summaryMetrics, upcomingInterviews } from '../data/dashboard'

const toneStyles = { indigo: 'bg-indigo-50 text-indigo-700', violet: 'bg-violet-50 text-violet-700', amber: 'bg-amber-50 text-amber-700', emerald: 'bg-emerald-50 text-emerald-700' } as const

export function DashboardPage() {
  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Tuesday, October 6" title="Good morning, Rehan" description="Here’s what’s happening across your job search. You have two priority actions today." action={<Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700" to="/app/jobs">Explore jobs <ArrowUpRight size={16} /></Link>} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Job search summary">
        {summaryMetrics.map((metric) => <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40" key={metric.label}><div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-500">{metric.label}</p><span className={`size-2 rounded-full ${toneStyles[metric.tone].split(' ')[0]}`} /></div><p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{metric.value}</p><p className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${toneStyles[metric.tone]}`}>{metric.change}</p></article>)}
      </section>
      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="font-bold text-slate-950">Recent applications</h2><p className="mt-1 text-xs text-slate-500">Your latest application activity</p></div><Link className="text-sm font-bold text-indigo-600" to="/app/applications">View all</Link></div>
          <div className="divide-y divide-slate-100">
            {recentApplications.map((item) => <div className="flex items-center gap-3 px-5 py-4 sm:px-6" key={item.company}><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">{item.initials}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{item.role}</p><p className="text-xs text-slate-500">{item.company}</p></div><span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 sm:block">{item.status}</span><span className="text-xs text-slate-400">{item.date}</span><ChevronRight className="text-slate-300" size={17} /></div>)}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <div className="flex items-center gap-2"><CalendarDays className="text-indigo-600" size={18} /><h2 className="font-bold text-slate-950">Upcoming interviews</h2></div>
          <div className="mt-5 space-y-3">{upcomingInterviews.map((item) => <div className="rounded-xl border border-slate-100 bg-slate-50 p-4" key={item.company}><div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-900">{item.company}</p><span className="size-2 rounded-full bg-indigo-500" /></div><p className="mt-1 text-xs text-slate-500">{item.type}</p><p className="mt-3 text-xs font-semibold text-indigo-700">{item.time}</p></div>)}</div>
        </section>
      </div>
      <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/40">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300"><Sparkles size={19} /></span><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Recommended next actions</p><h2 className="mt-2 text-xl font-bold">Keep your momentum moving</h2><p className="mt-1 text-sm text-slate-400">Focus on the two steps most likely to improve your week.</p></div></div><div className="flex flex-col gap-2 sm:flex-row"><Link className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/15" to="/app/interview"><CircleCheckBig size={16} /> Prepare for Linear</Link><Link className="rounded-xl bg-indigo-500 px-4 py-2.5 text-center text-sm font-bold hover:bg-indigo-400" to="/app/resume">Tailor your resume</Link></div></div>
      </section>
    </div>
  )
}
