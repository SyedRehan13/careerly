import { AlertCircle, CheckCircle2, Laptop, Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Brand } from '../components/common/Brand'
import { useAuth } from '../hooks/useAuth'

function getConfirmationError() {
  const hashParameters = new URLSearchParams(window.location.hash.slice(1))
  const queryParameters = new URLSearchParams(window.location.search)

  return hashParameters.get('error_description') ?? queryParameters.get('error_description')
}

export function EmailConfirmedPage() {
  const { user, isLoading } = useAuth()
  const confirmationError = getConfirmationError()

  return (
    <main className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
      <Brand />
      <div className="mx-auto my-auto w-full max-w-lg py-16 text-center">
        {confirmationError ? (
          <>
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-50 text-rose-600"><AlertCircle size={30} /></span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-rose-600">Confirmation problem</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">We couldn’t confirm that link</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{confirmationError}</p>
            <Link className="mt-8 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800" to="/signup">Try signing up again</Link>
          </>
        ) : (
          <>
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={30} /></span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Email verified</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Your Careerly account is ready</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              {isLoading ? 'Finishing confirmation…' : user ? 'This device is verified. You can return to the laptop where you started.' : 'Your email has been processed. Return to your laptop and log in to continue.'}
            </p>
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><Smartphone className="text-indigo-600" size={20} /><p className="mt-3 text-sm font-bold text-slate-900">On this phone</p><p className="mt-1 text-xs leading-5 text-slate-500">You can safely close this page.</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><Laptop className="text-indigo-600" size={20} /><p className="mt-3 text-sm font-bold text-slate-900">On your laptop</p><p className="mt-1 text-xs leading-5 text-slate-500">Return to Careerly and log in.</p></div>
            </div>
            <Link className="mt-8 inline-flex rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-slate-400" to="/login">Continue on this device</Link>
          </>
        )}
      </div>
    </main>
  )
}

