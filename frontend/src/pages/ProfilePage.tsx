import { Mail, ShieldCheck, UserRound } from 'lucide-react'

import { PageHeader } from '../components/common/PageHeader'
import { ProfileSection } from '../components/profile/ProfileSection'
import { useAuth } from '../hooks/useAuth'

export function ProfilePage() {
  const { user } = useAuth()
  const joinedAt = user?.created_at
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(user.created_at))
    : 'Not available'

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Profile" title="Your profile" description="Manage your career profile and account details." />
      <ProfileSection />
      <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <span className="grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><UserRound size={25} /></span>
            <div><h2 className="text-xl font-bold text-slate-950">Account details</h2><p className="mt-1 text-sm text-slate-500">Careerly member</p></div>
          </div>
          <dl className="mt-6 space-y-5">
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Email address</dt><dd className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><Mail size={16} className="text-slate-400" />{user?.email}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Member since</dt><dd className="mt-2 text-sm font-semibold text-slate-800">{joinedAt}</dd></div>
          </dl>
        </section>
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <ShieldCheck className="text-emerald-600" size={24} />
          <h2 className="mt-4 font-bold text-emerald-950">Account protected</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-800">Your session is managed securely by Supabase Auth and persists when you return to Careerly.</p>
          <p className="mt-5 text-xs font-semibold text-emerald-700">Email {user?.email_confirmed_at ? 'confirmed' : 'confirmation pending'}</p>
        </section>
      </div>
    </div>
  )
}

