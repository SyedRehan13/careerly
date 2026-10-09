import { Check, MapPin, UserRound } from 'lucide-react'
import { ErrorState, LoadingState, SuccessNotice } from '../common/WorkspaceUI'
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
    full_name: profile.full_name ?? '',
    headline: profile.headline ?? '',
    location: profile.location ?? '',
    bio: profile.bio ?? '',
  }
}

const inputClass = 'field'

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
  const isDirty =
    draft.full_name !== saved.full_name ||
    draft.headline !== saved.headline ||
    draft.location !== saved.location ||
    draft.bio !== saved.bio
  const filledDetails = Object.values(draft).filter((value) => value.trim()).length
  const initials = draft.full_name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

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
      <div className="profile-introduction" aria-label="Career profile preview">
        <div className="profile-identity">
          <span className="profile-preview-avatar" aria-hidden="true">{initials || <UserRound size={26} />}</span>
          <div className="min-w-0">
            <p className="eyebrow">Your introduction · Live preview</p>
            <h3>{draft.full_name.trim() || 'Your name'}</h3>
            <p>{draft.headline.trim() || 'A few words about the work you want to do.'}</p>
            {draft.location.trim() && <p className="profile-preview-location"><MapPin size={13} />{draft.location}</p>}
          </div>
        </div>
        <div className="profile-progress">
          <div><span>Profile details</span><span>{filledDetails} of 4 added</span></div>
          <progress value={filledDetails} max={4} aria-label="Profile details added" />
        </div>
      </div>
      <fieldset disabled={mutation.isPending} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field-label" htmlFor="profile-name">
            Full name
            <input
              id="profile-name"
              className={inputClass}
              value={draft.full_name}
              onChange={(event) => change('full_name', event.target.value)}
              maxLength={200}
              autoComplete="name"
            />
          </label>
          <label className="field-label" htmlFor="profile-location">
            Location
            <input
              id="profile-location"
              className={inputClass}
              value={draft.location}
              onChange={(event) => change('location', event.target.value)}
              maxLength={200}
              placeholder="City, country or remote"
              autoComplete="address-level2"
            />
          </label>
        </div>
        <label className="field-label" htmlFor="profile-headline">
          Headline
          <input
            id="profile-headline"
            className={inputClass}
            value={draft.headline}
            onChange={(event) => change('headline', event.target.value)}
            maxLength={200}
            placeholder="What you do and the opportunities you are looking for"
          />
          <span className="field-help">For example: Frontend developer looking for a role in product engineering.</span>
        </label>
        <label className="field-label" htmlFor="profile-bio">
          About you
          <textarea
            id="profile-bio"
            className={inputClass}
            value={draft.bio}
            onChange={(event) => change('bio', event.target.value)}
            maxLength={5000}
            rows={5}
            placeholder="Share your experience, interests, and career goals"
          />
          <span className="field-help">{draft.bio.length}/5,000 characters</span>
        </label>
      </fieldset>
      {mutation.isError && (
        <p role="alert" className="notice notice-error">
          {getApiErrorMessage(mutation.error)}
        </p>
      )}
      {mutation.isSuccess && <SuccessNotice>Your profile is up to date.</SuccessNotice>}
      <div className="form-actions profile-form-actions">
        <span className="save-state" role="status">
          {mutation.isPending ? 'Saving your profile…' : isDirty ? 'You have unsaved changes' : <><Check size={14} /> All changes saved</>}
        </span>
        <button type="submit" disabled={!isDirty || mutation.isPending} className="btn btn-primary">
          {mutation.isPending ? 'Saving…' : 'Save changes'}
        </button>
        <button
          type="button"
          disabled={!isDirty || mutation.isPending}
          onClick={() => {
            setDraft(toDraft(profile))
            mutation.reset()
          }}
          className="btn btn-secondary"
        >
          Reset changes
        </button>
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
    <section className="panel panel-padding" aria-labelledby="career-profile-title">
      <div className="section-heading">
        <div>
          <h2 id="career-profile-title">Career profile</h2>
          <p>Introduce yourself and the work you want to do. All fields are optional.</p>
        </div>
        <UserRound size={18} className="muted" />
      </div>
      {query.isPending && <LoadingState label="Loading your profile" />}
      {query.isError && (
        <ErrorState
          message={getApiErrorMessage(query.error)}
          retry={() => {
            void query.refetch()
          }}
          busy={query.isFetching}
          stale={Boolean(query.data)}
        />
      )}
      {query.data && <ProfileEditor profile={query.data} userId={userId} />}
    </section>
  )
}

export function ProfileSection() {
  const { user } = useAuth()
  return user ? <ProfileWorkspace key={user.id} userId={user.id} /> : null
}
