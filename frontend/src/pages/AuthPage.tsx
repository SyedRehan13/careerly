import type { FormEvent } from 'react'
import { useState } from 'react'
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, CalendarDays, Check,
  ClipboardList, Eye, EyeOff, Layers3, LoaderCircle, LockKeyhole, Mail, UserRound,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Brand } from '../components/common/Brand'
import { SuccessNotice } from '../components/common/WorkspaceUI'
import { useAuth } from '../hooks/useAuth'
import '../styles/auth.css'

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
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="password-wrap auth-input">
        <LockKeyhole size={17} className="auth-input-icon" aria-hidden="true" />
        <input
          id={id}
          className="field"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            autoComplete === 'new-password' ? 'At least 8 characters' : 'Enter your password'
          }
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          minLength={8}
          required
          type={isVisible ? 'text' : 'password'}
        />
        <button
          className="password-toggle"
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={isVisible}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-[var(--danger)]" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function getRedirectPath(state: unknown) {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string'
  ) {
    return state.from
  }

  return '/app'
}

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.8 27.8a12 12 0 0 1 0-7.6v-5.3H5.9a20 20 0 0 0 0 18.2l6.9-5.3Z" />
      <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.9 14.9l6.9 5.3C14.4 15.5 18.8 12 24 12Z" />
    </svg>
  )
}

function AuthShowcase({ isLogin }: { isLogin: boolean }) {
  return (
    <aside className="auth-story" aria-label="Your Careerly workspace">
      <div className="auth-story-topline">
        <span className="auth-story-tag"><span /> A little clarity. A lot of possibility.</span>
        <ArrowUpRight size={21} aria-hidden="true" />
      </div>
      <div className="auth-story-copy">
        <p className="eyebrow">Your career, with direction</p>
        <h2>{isLogin ? <>Good things<br />are <em>ahead.</em></> : <>Make room<br />for <em>what’s next.</em></>}</h2>
        <p>{isLogin
          ? 'Pick up where you left off. Your opportunities, conversations, and next steps are right here.'
          : 'Your ambitions deserve a place of their own. Bring your job search together and move forward with a clear plan.'}</p>
      </div>
      <div className="auth-workspace-art">
        <div className="auth-preview-card">
          <div className="auth-preview-heading">
            <span className="auth-preview-mark"><Layers3 size={20} /></span>
            <div><p>YOUR PERSONAL WORKSPACE</p><h3>Everything in its place.</h3></div>
            <span className="auth-preview-dots" aria-hidden="true">•••</span>
          </div>
          {[
            { icon: Bookmark, title: 'Opportunities worth saving', copy: 'A shortlist built around you.', number: '01' },
            { icon: ClipboardList, title: 'Every application, in view', copy: 'From the first step to the final offer.', number: '02' },
            { icon: CalendarDays, title: 'Your next move, planned', copy: 'Follow-ups that stay on your radar.', number: '03' },
          ].map(({ icon: Icon, title, copy, number }) => (
            <div className="auth-preview-row" key={number}>
              <span className="auth-preview-icon"><Icon size={18} strokeWidth={1.7} /></span>
              <div><h4>{title}</h4><p>{copy}</p></div>
              <span className="auth-preview-number">{number}</span>
            </div>
          ))}
          <div className="auth-preview-caption"><span className="status-dot" /> A preview of a more organized search</div>
        </div>
        <div className="auth-floating-note">
          <span><Check size={17} /></span>
          <div><strong>One clear next step.</strong><p>That’s where progress begins.</p></div>
        </div>
      </div>
      <div className="auth-story-bottom"><span>Built around your next chapter.</span><span>CAREERLY</span></div>
    </aside>
  )
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
          setSuccessMessage(
            'Check your email to confirm your account. You can open the link on any device, then return here to log in.',
          )
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
    <main className={`auth-layout auth-layout--${mode}`}>
        <header className="auth-topbar">
          <Brand />
          <Link className="auth-back-link" to="/">
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </header>
      <div className="auth-shell">
      <section className="auth-main" aria-labelledby="auth-title">
        <div className="auth-form-area">
          <nav className="auth-mode-switch" aria-label="Account access">
            <Link to="/login" aria-current={isLogin ? 'page' : undefined}>Log in</Link>
            <Link to="/signup" aria-current={!isLogin ? 'page' : undefined}>Sign up</Link>
          </nav>
          <span className="auth-welcome-icon" aria-hidden="true">{isLogin ? <LockKeyhole size={24} strokeWidth={1.6} /> : <UserRound size={24} strokeWidth={1.6} />}</span>
          <p className="eyebrow text-brand-600">
            {isLogin ? 'Welcome to your workspace' : 'Your career starts here'}
          </p>
          <h1 id="auth-title">{isLogin ? 'Good to have you back.' : 'Make your next move.'}</h1>
          <p className="auth-form-description">
            {isLogin
              ? 'Log in and pick up where you left off.'
              : 'One account for your saved jobs, applications, and next steps.'}
          </p>
          {!isConfigured && (
            <p className="notice notice-warning mt-6" role="alert">
              Sign-in is temporarily unavailable. Please try again once the service is configured.
            </p>
          )}
          {error && (
            <p className="notice notice-error mt-6" role="alert">
              {error}
            </p>
          )}
          {successMessage && (
            <div className="mt-6">
              <SuccessNotice>{successMessage}</SuccessNotice>
            </div>
          )}
          <form className="mt-7" onSubmit={handleSubmit}>
            <fieldset disabled={isSubmitting} className="auth-fields">
              {!isLogin && (
                <label className="field-label">
                  Full name
                  <span className="auth-input">
                  <UserRound size={17} className="auth-input-icon" aria-hidden="true" />
                  <input
                    className="field"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    minLength={2}
                    required
                    type="text"
                  />
                  </span>
                </label>
              )}
              <label className="field-label">
                Email address
                <span className="auth-input">
                <Mail size={17} className="auth-input-icon" aria-hidden="true" />
                <input
                  className="field"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  type="email"
                />
                </span>
              </label>
              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              {!isLogin && (
                <>
                <PasswordField
                  id="confirm-password"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  error={
                    confirmPassword && password !== confirmPassword
                      ? 'Passwords do not match.'
                      : undefined
                  }
                />
                <div className="auth-password-guide" aria-label="Password requirements">
                  <span className={password.length >= 8 ? 'satisfied' : ''}>
                    {password.length >= 8 ? <Check size={13} aria-hidden="true" /> : <span className="auth-requirement-dot" aria-hidden="true" />} At least 8 characters
                    {password.length >= 8 && <span className="sr-only"> — met</span>}
                  </span>
                  <span className={Boolean(confirmPassword) && password === confirmPassword ? 'satisfied' : ''}>
                    {Boolean(confirmPassword) && password === confirmPassword ? <Check size={13} aria-hidden="true" /> : <span className="auth-requirement-dot" aria-hidden="true" />} Passwords match
                    {Boolean(confirmPassword) && password === confirmPassword && <span className="sr-only"> — met</span>}
                  </span>
                </div>
                </>
              )}
              <button
                className="btn btn-primary w-full auth-submit"
                disabled={!isConfigured || isSubmitting}
                type="submit"
              >
                {isSubmitting ? <LoaderCircle className="animate-spin" size={16} /> : null}
                {isSubmitting
                  ? 'Just a moment…'
                  : isLogin
                    ? 'Log in to your workspace'
                    : 'Create your account'}
                {!isSubmitting && <ArrowRight size={15} />}
              </button>
            </fieldset>
          </form>
          <div className="auth-divider" aria-hidden="true"><span>or continue with</span></div>
          <button
            className="btn btn-secondary auth-google-button"
            type="button"
            disabled
            title="Google sign-in is coming soon"
          >
            <GoogleMark />
            Continue with Google
            <span className="auth-google-coming-soon">Coming soon</span>
          </button>
          <p className="auth-switch-prompt">
            {isLogin ? 'New here?' : 'Already have an account?'}{' '}
            <Link className="text-link text-xs" to={isLogin ? '/signup' : '/login'}>
              {isLogin ? 'Sign up' : 'Log in'}
            </Link>
          </p>
          <div className="auth-form-note"><LockKeyhole size={13} aria-hidden="true" /> Your personal career workspace</div>
        </div>
        <div className="auth-benefits" aria-label="Included in your workspace">
          <span><Bookmark size={14} /> Save roles</span>
          <span><ClipboardList size={14} /> Track progress</span>
          <span><CalendarDays size={14} /> Plan next steps</span>
        </div>
      </section>
      <AuthShowcase isLogin={isLogin} />
      </div>
      <footer className="auth-footer"><span>© {new Date().getFullYear()} Careerly</span><span>Your career. Your next chapter.</span></footer>
    </main>
  )
}
