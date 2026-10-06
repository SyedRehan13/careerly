import type { FormEvent } from 'react'
import { useState } from 'react'
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Brand } from '../components/common/Brand'
import { useAuth } from '../hooks/useAuth'

interface AuthPageProps {
  mode: 'login' | 'signup'
}

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  error?: string
}

function PasswordField({ id, label, value, onChange, autoComplete, error }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700" htmlFor={id}>{label}</label>
      <div className="relative mt-2">
        <input
          id={id}
          className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 font-normal outline-none transition focus:ring-4 ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="At least 8 characters"
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          minLength={8}
          required
          type={isVisible ? 'text' : 'password'}
        />
        <button
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 transition hover:text-slate-700"
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={isVisible}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-rose-600" id={`${id}-error`}>{error}</p>}
    </div>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function getRedirectPath(state: unknown) {
  if (typeof state === 'object' && state !== null && 'from' in state && typeof state.from === 'string') {
    return state.from
  }

  return '/app'
}

export function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === 'login'
  const { signIn, signUp, isConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match. Please enter them again.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isLogin) {
        await signIn({ email, password })
        navigate(getRedirectPath(location.state), { replace: true })
      } else {
        const result = await signUp({ fullName, email, password })
        if (result.emailConfirmationRequired) {
          setSuccessMessage('Check your email on any device. After confirming, return to this laptop and log in.')
        } else {
          navigate('/app', { replace: true })
        }
      }
    } catch (submissionError) {
      setError(getErrorMessage(submissionError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Brand />
          <Link className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900" to="/"><ArrowLeft size={16} /> Home</Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-md py-16">
          <p className="text-sm font-bold text-indigo-600">{isLogin ? 'WELCOME BACK' : 'START YOUR JOURNEY'}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{isLogin ? 'Log in to Careerly' : 'Create your Careerly account'}</h1>
          <p className="mt-2 text-sm text-slate-500">{isLogin ? 'Pick up where you left off in your job search.' : 'Bring every part of your job search into one focused workspace.'}</p>

          {!isConfigured && (
            <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <div><p className="font-bold">Supabase setup required</p><p className="mt-1 leading-5 text-amber-800">Add your project URL and publishable key to <code>frontend/.env.local</code>, then restart the development server.</p></div>
            </div>
          )}

          {error && <div className="mt-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert"><AlertCircle className="mt-0.5 shrink-0" size={17} />{error}</div>}
          {successMessage && <div className="mt-6 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700" role="status"><CheckCircle2 className="mt-0.5 shrink-0" size={17} />{successMessage}</div>}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <label className="block text-sm font-semibold text-slate-700">Full name
                <input className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" autoComplete="name" minLength={2} required type="text" />
              </label>
            )}
            <label className="block text-sm font-semibold text-slate-700">Email address
              <input className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required type="email" />
            </label>
            <PasswordField id="password" label="Password" value={password} onChange={setPassword} autoComplete={isLogin ? 'current-password' : 'new-password'} />
            {!isLogin && (
              <PasswordField
                id="confirm-password"
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                error={confirmPassword && password !== confirmPassword ? 'Passwords do not match.' : undefined}
              />
            )}
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={!isConfigured || isSubmitting} type="submit">
              {isSubmitting && <LoaderCircle className="animate-spin" size={17} />}{isSubmitting ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">{isLogin ? 'New to Careerly?' : 'Already have an account?'} <Link className="font-bold text-indigo-600 hover:text-indigo-700" to={isLogin ? '/signup' : '/login'}>{isLogin ? 'Create an account' : 'Log in'}</Link></p>
        </div>
      </section>
      <section className="hidden items-center justify-center bg-slate-950 p-16 text-white lg:flex">
        <div className="max-w-lg"><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">From opportunity to offer</p><blockquote className="mt-5 text-4xl font-semibold leading-tight tracking-tight">“A calm, organized job search creates room for your best work to show.”</blockquote><div className="mt-10 h-px bg-white/15" /><p className="mt-6 text-sm leading-6 text-slate-400">Careerly keeps the next right action visible, whether you are saving a role, tailoring your resume, or preparing for the conversation that matters.</p></div>
      </section>
    </main>
  )
}
