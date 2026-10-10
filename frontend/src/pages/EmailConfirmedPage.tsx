import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle, MailCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PublicMessageLayout } from '../components/common/PublicMessageLayout'
import { useAuth } from '../hooks/useAuth'

function getConfirmationError() {
  const hashParameters = new URLSearchParams(window.location.hash.slice(1))
  const queryParameters = new URLSearchParams(window.location.search)
  return hashParameters.get('error_description') ?? queryParameters.get('error_description')
}

export function EmailConfirmedPage() {
  const { user, isLoading } = useAuth()
  const error = getConfirmationError()
  return (
    <PublicMessageLayout>
        <span className="empty-icon mx-auto">
          {error ? (
            <AlertCircle size={25} />
          ) : isLoading ? (
            <LoaderCircle className="animate-spin" size={25} />
          ) : user ? (
            <CheckCircle2 size={25} />
          ) : (
            <MailCheck size={25} />
          )}
        </span>
        <p className="eyebrow">
          {error ? 'A small detour' : isLoading ? 'One moment' : 'Your next chapter'}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mt-4">
          {error
            ? 'That link needs another try.'
            : isLoading
              ? 'Checking your confirmation…'
              : user
                ? "You're ready to move forward."
                : 'Continue to your workspace.'}
        </h1>
        <p className="text-sm muted leading-7 mt-4" role={error ? 'alert' : 'status'}>
          {error ||
            (isLoading
              ? 'Please wait while we check your session.'
              : user
                ? 'You are signed in on this device. If you started on another device, you can return there and log in.'
                : 'If you followed a verification email, log in to continue. You can use this device or return to the one where you started.')}
        </p>
        {!isLoading && (
          <Link className="btn btn-primary mt-7" to={error ? '/signup' : user ? '/app' : '/login'}>
            {error ? 'Back to sign up' : user ? 'Open your workspace' : 'Continue to log in'}
            <ArrowRight size={15} />
          </Link>
        )}
        <p className="text-xs muted mt-6">Your progress is waiting for you.</p>
    </PublicMessageLayout>
  )
}
