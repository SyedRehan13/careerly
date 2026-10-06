import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/common/Brand'

const benefits = ['Discover the right opportunities', 'Understand your fit before applying', 'Keep every application organized', 'Tailor resumes for each role', 'Prepare with purpose', 'Turn progress into offers']

export function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] bg-[radial-gradient(circle_at_70%_20%,rgba(199,210,254,0.55),transparent_35%),radial-gradient(circle_at_20%_10%,rgba(224,231,255,0.65),transparent_32%)]" />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Public navigation">
          <Link className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-950" to="/login">Log in</Link>
          <Link className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800" to="/signup">Get started</Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-20 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:pb-28 lg:pt-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur">
              <span className="size-1.5 rounded-full bg-indigo-500" /> Your career search, finally in one place
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              An intelligent workspace for your entire job search.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
              Careerly brings opportunities, applications, resumes, and interview preparation into one focused workflow—so every step moves you closer to an offer.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700" to="/signup">Get Started <ArrowRight size={17} /></Link>
              <Link className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm hover:border-slate-400" to="/app">View Dashboard</Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-indigo-100/50 blur-2xl" />
            <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-2xl shadow-slate-300/50 backdrop-blur sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">This week</p><p className="mt-1 text-xl font-bold text-slate-950">Your job search</p></div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">On track</span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-5">
                {[['12', 'Active applications'], ['3', 'Interviews'], ['8', 'Saved roles'], ['24%', 'Response rate']].map(([value, label]) => (
                  <div className="rounded-2xl bg-slate-50 p-4" key={label}><p className="text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>
                ))}
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Recommended next</p>
                <p className="mt-2 font-semibold text-slate-900">Prepare for your product interview</p>
                <p className="mt-1 text-sm text-slate-500">Tomorrow at 10:30 AM · 25 min prep plan</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">One connected workflow</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Move from searching to signed offer with clarity.</h2></div>
            <div className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => <div className="flex items-center gap-3 text-sm font-semibold text-slate-700" key={benefit}><CheckCircle2 className="text-indigo-600" size={19} />{benefit}</div>)}
            </div>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl items-center justify-between px-5 py-8 text-xs text-slate-500 sm:px-8"><span>© 2026 Careerly</span><span>Built for focused job searches.</span></footer>
    </div>
  )
}

