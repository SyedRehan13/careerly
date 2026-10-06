import type { Session, User } from '@supabase/supabase-js'

export interface SignUpInput {
  fullName: string
  email: string
  password: string
}

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpResult {
  emailConfirmationRequired: boolean
}

export interface AuthContextValue {
  session: Session | null
  user: User | null
  isLoading: boolean
  isConfigured: boolean
  signIn: (input: SignInInput) => Promise<void>
  signUp: (input: SignUpInput) => Promise<SignUpResult>
  signOut: () => Promise<void>
}

