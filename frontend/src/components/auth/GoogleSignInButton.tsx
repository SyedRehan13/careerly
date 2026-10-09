import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../../lib/supabase'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

export function GoogleSignInButton() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  async function handleSuccess(credential?: string) {
    setError(null)

    if (!credential) {
      setError('Google did not return a sign-in credential. Please try again.')
      return
    }

    if (!supabase) {
      setError('Google sign-in is unavailable because Supabase is not configured.')
      return
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
      })

      if (signInError) throw signInError
      navigate('/app', { replace: true })
    } catch (signInError) {
      setError(signInError instanceof Error
        ? signInError.message
        : 'Google sign-in failed. Please try again.')
    }
  }

  return (
    <div className="w-full">
      {googleClientId ? (
        <div className="flex min-h-11 w-full justify-center">
          <GoogleLogin
            onSuccess={({ credential }) => void handleSuccess(credential)}
            onError={() => setError('Google sign-in failed. Please try again.')}
            theme="outline"
            size="large"
            shape="rectangular"
            text="continue_with"
            width="400"
          />
        </div>
      ) : (
        <button className="btn btn-secondary auth-google-button" type="button" disabled>
          Continue with Google
        </button>
      )}
      {error ? (
        <p className="mt-2 text-xs text-[var(--danger)]" role="alert">{error}</p>
      ) : !googleClientId ? (
        <p className="mt-2 text-xs text-[var(--danger)]" role="status">
          Google sign-in is unavailable. Add VITE_GOOGLE_CLIENT_ID to frontend/.env.local.
        </p>
      ) : null}
    </div>
  )
}
