import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/common/Brand'

interface AuthPageProps { mode: 'login' | 'signup' }

export function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === 'login'
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between"><Brand /><Link className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900" to="/"><ArrowLeft size={16} /> Home</Link></div>
        <div className="mx-auto my-auto w-full max-w-md py-16">
          <p className="text-sm font-bold text-indigo-600">{isLogin ? 'WELCOME BACK' : 'START YOUR JOURNEY'}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{isLogin ? 'Log in to Careerly' : 'Create your Careerly account'}</h1>
          <p className="mt-2 text-sm text-slate-500">{isLogin ? 'Pick up where you left off in your job search.' : 'Bring every part of your job search into one focused workspace.'}</p>
          <form className="mt-8 space-y-5" onSubmit={(event) => event.preventDefault()}>
            {!isLogin && <label className="block text-sm font-semibold text-slate-700">Full name<input className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="Your name" type="text" /></label>}
            <label className="block text-sm font-semibold text-slate-700">Email address<input className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="you@example.com" type="email" /></label>
            <label className="block text-sm font-semibold text-slate-700">Password<input className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="At least 8 characters" type="password" /></label>
            <button className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700" type="submit">{isLogin ? 'Log in' : 'Create account'}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">{isLogin ? 'New to Careerly?' : 'Already have an account?'} <Link className="font-bold text-indigo-600 hover:text-indigo-700" to={isLogin ? '/signup' : '/login'}>{isLogin ? 'Create an account' : 'Log in'}</Link></p>
          <p className="mt-5 text-center text-xs leading-5 text-slate-400">Authentication is a visual placeholder in this foundation phase.</p>
        </div>
      </section>
      <section className="hidden items-center justify-center bg-slate-950 p-16 text-white lg:flex">
        <div className="max-w-lg"><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">From opportunity to offer</p><blockquote className="mt-5 text-4xl font-semibold leading-tight tracking-tight">“A calm, organized job search creates room for your best work to show.”</blockquote><div className="mt-10 h-px bg-white/15" /><p className="mt-6 text-sm leading-6 text-slate-400">Careerly keeps the next right action visible, whether you are saving a role, tailoring your resume, or preparing for the conversation that matters.</p></div>
      </section>
    </main>
  )
}

