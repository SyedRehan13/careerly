import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { useAuth } from '../../hooks/useAuth'
import { getApiErrorMessage } from '../../services/api'
import { getProfile, profileQueryKey, updateProfile } from '../../services/profile'
import type { Profile, ProfileUpdate } from '../../types/profile'

interface ProfileDraft {
  full_name: string
  headline: string
  location: string
  bio: string
}

function toDraft(profile: Profile): ProfileDraft {
  return {
    full_name: profile.full_name ?? '', headline: profile.headline ?? '',
    location: profile.location ?? '', bio: profile.bio ?? '',
  }
}

const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50'

function ProfileEditor({ profile, userId }: { profile: Profile; userId: string }) {
  const [draft, setDraft] = useState(() => toDraft(profile))
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (changes: ProfileUpdate) => updateProfile(userId, changes),
    onSuccess: (saved) => {
      queryClient.setQueryData(profileQueryKey(userId), saved)
      setDraft(toDraft(saved))
    },
  })
  const saved = toDraft(profile)
  const isDirty = draft.full_name !== saved.full_name || draft.headline !== saved.headline
    || draft.location !== saved.location || draft.bio !== saved.bio

  function change(field: keyof ProfileDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
    mutation.reset()
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isDirty || mutation.isPending) return
    mutation.mutate({
      full_name: draft.full_name.trim() || null,
      headline: draft.headline.trim() || null,
      location: draft.location.trim() || null,
      bio: draft.bio.trim() || null,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset disabled={mutation.isPending} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="profile-name">Full name
            <input id="profile-name" className={inputClass} value={draft.full_name} onChange={(event) => change('full_name', event.target.value)} maxLength={200} autoComplete="name" />
          </label>
          <label className="text-sm font-semibold text-slate-700" htmlFor="profile-location">Location
            <input id="profile-location" className={inputClass} value={draft.location} onChange={(event) => change('location', event.target.value)} maxLength={200} placeholder="City, country or remote" autoComplete="address-level2" />
          </label>
        </div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="profile-headline">Headline
          <input id="profile-headline" className={inputClass} value={draft.headline} onChange={(event) => change('headline', event.target.value)} maxLength={200} placeholder="What you do and the opportunities you are looking for" />
        </label>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="profile-bio">About you
          <textarea id="profile-bio" className={inputClass} value={draft.bio} onChange={(event) => change('bio', event.target.value)} maxLength={5000} rows={5} placeholder="Share your experience, interests, and career goals" />
          <span className="mt-1 block text-xs font-normal text-slate-500">{draft.bio.length}/5,000 characters</span>
        </label>
      </fieldset>
      {mutation.isError && <p role="alert" className="text-sm text-red-700">{getApiErrorMessage(mutation.error)}</p>}
      {mutation.isSuccess && <p role="status" className="text-sm font-semibold text-emerald-700">Profile saved.</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!isDirty || mutation.isPending} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{mutation.isPending ? 'Saving…' : 'Save changes'}</button>
        <button type="button" disabled={!isDirty || mutation.isPending} onClick={() => { setDraft(toDraft(profile)); mutation.reset() }} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Reset changes</button>
      </div>
    </form>
  )
}

function ProfileWorkspace({ userId }: { userId: string }) {
  const query = useQuery({
    queryKey: profileQueryKey(userId),
    queryFn: ({ signal }) => getProfile(userId, signal),
    retry: false,
    gcTime: 0,
  })

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40" aria-labelledby="career-profile-title">
      <h2 id="career-profile-title" className="text-lg font-bold text-slate-950">Your career profile</h2>
      <p className="mb-6 mt-1 text-sm text-slate-500">Keep your career details up to date. All fields are optional.</p>
      {query.isPending && <p role="status" className="text-sm text-slate-500">Loading your profile…</p>}
      {query.isError && (
        <div role="alert" className="space-y-3 text-sm text-red-700">
          <p>{getApiErrorMessage(query.error)}</p>
          <button type="button" disabled={query.isFetching} onClick={() => { void query.refetch() }} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:opacity-50">{query.isFetching ? 'Retrying…' : 'Try again'}</button>
        </div>
      )}
      {query.data && <ProfileEditor profile={query.data} userId={userId} />}
    </section>
  )
}

export function ProfileSection() {
  const { user } = useAuth()
  return user ? <ProfileWorkspace key={user.id} userId={user.id} /> : null
}
