import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { SignInInput, SignUpInput, SignUpResult } from '../types/auth'
import { AuthContext } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add the required values to frontend/.env.local.')
  }

  return supabase
}

function getEmailConfirmationUrl() {
  const configuredAppUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim()
  const appUrl = configuredAppUrl || window.location.origin

  return `${appUrl.replace(/\/$/, '')}/auth/confirmed`
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      return
    }

    let isActive = true

    void supabase.auth.getSession().then(({ data }) => {
      if (isActive) {
        setSession(data.session)
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isActive) {
        setSession(nextSession)
        setIsLoading(false)
      }
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    isLoading,
    isConfigured: isSupabaseConfigured,
    signIn: async ({ email, password }: SignInInput) => {
      const { error } = await requireSupabase().auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    signUp: async ({ fullName, email, password }: SignUpInput): Promise<SignUpResult> => {
      const { data, error } = await requireSupabase().auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: getEmailConfirmationUrl(),
        },
      })

      if (error) throw error
      return { emailConfirmationRequired: data.session === null }
    },
    signOut: async () => {
      const { error } = await requireSupabase().auth.signOut()
      if (error) throw error
    },
  }), [isLoading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
