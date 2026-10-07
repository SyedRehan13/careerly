import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { getApiErrorMessage } from '../../services/api'
import { createApplication, updateApplication } from '../../services/applications'
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS, isApplicationStatus } from '../../types/application'
import type { Application, ApplicationInput, ApplicationStatus } from '../../types/application'
import { safeJobUrl } from '../../utils/job-url'

interface ApplicationFormProps {
  userId: string
  application: Application | null
  onSaved: (application: Application) => Promise<void>
  onCancel: () => void
}

const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50'

export function ApplicationForm({ userId, application, onSaved, onCancel }: ApplicationFormProps) {
  const [draft, setDraft] = useState(() => ({
    title: application?.title ?? '', company: application?.company ?? '',
    location: application?.location ?? '', job_url: application?.job_url ?? '',
    applied_date: application?.applied_date ?? '', follow_up_date: application?.follow_up_date ?? '',
    notes: application?.notes ?? '',
  }))
  const [status, setStatus] = useState<ApplicationStatus>(application?.status ?? 'applied')
  const [validationError, setValidationError] = useState('')
  const mutation = useMutation({
    mutationFn: (input: ApplicationInput) => application
      ? updateApplication(userId, application.id, input)
      : createApplication(userId, input),
    onSuccess: onSaved,
  })

  function change(field: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending) return
    setValidationError('')
    mutation.reset()
    if (!draft.title.trim() || !draft.company.trim()) {
      setValidationError('Enter a job title and company name.')
      return
    }
    if (draft.job_url.trim() && !safeJobUrl(draft.job_url.trim())) {
      setValidationError('Enter a complete job link starting with http:// or https://.')
      return
    }
    mutation.mutate({
      title: draft.title.trim(), company: draft.company.trim(),
      location: draft.location.trim() || null, job_url: draft.job_url.trim() || null,
      status, applied_date: draft.applied_date || null, follow_up_date: draft.follow_up_date || null,
      notes: draft.notes.trim() || null,
    })
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm" aria-labelledby="application-form-title">
      <h2 id="application-form-title" className="text-lg font-bold text-slate-950">{application ? 'Edit application' : 'Add an application'}</h2>
      <p className="mt-1 text-sm text-slate-500">Track a role you applied for and keep your next steps organized.</p>
      <form className="mt-5 space-y-5" onSubmit={submit}>
        <fieldset disabled={mutation.isPending} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="application-title">Job title <span aria-hidden="true">*</span>
              <input id="application-title" className={inputClass} value={draft.title} onChange={(event) => change('title', event.target.value)} required maxLength={200} />
            </label>
            <label className="text-sm font-semibold text-slate-700" htmlFor="application-company">Company <span aria-hidden="true">*</span>
              <input id="application-company" className={inputClass} value={draft.company} onChange={(event) => change('company', event.target.value)} required maxLength={200} />
            </label>
            <label className="text-sm font-semibold text-slate-700" htmlFor="application-status">Status
              <select id="application-status" className={inputClass} value={status} onChange={(event) => { if (isApplicationStatus(event.target.value)) setStatus(event.target.value) }}>
                {APPLICATION_STATUSES.map((value) => <option key={value} value={value}>{APPLICATION_STATUS_LABELS[value]}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700" htmlFor="application-location">Location
              <input id="application-location" className={inputClass} value={draft.location} onChange={(event) => change('location', event.target.value)} maxLength={200} />
            </label>
            <label className="text-sm font-semibold text-slate-700" htmlFor="application-applied-date">Applied date
              <input id="application-applied-date" className={inputClass} value={draft.applied_date} onChange={(event) => change('applied_date', event.target.value)} type="date" />
            </label>
            <label className="text-sm font-semibold text-slate-700" htmlFor="application-follow-up-date">Follow-up date
              <input id="application-follow-up-date" className={inputClass} value={draft.follow_up_date} onChange={(event) => change('follow_up_date', event.target.value)} type="date" />
            </label>
          </div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="application-url">Job link
            <input id="application-url" className={inputClass} value={draft.job_url} onChange={(event) => change('job_url', event.target.value)} type="url" maxLength={2048} placeholder="https://example.com/jobs/role" />
          </label>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="application-notes">Notes
            <textarea id="application-notes" className={inputClass} value={draft.notes} onChange={(event) => change('notes', event.target.value)} rows={5} maxLength={20000} placeholder="Contacts, interview preparation, or your next action" />
            <span className="mt-1 block text-xs font-normal text-slate-500">{draft.notes.length.toLocaleString()}/20,000 characters</span>
          </label>
        </fieldset>
        {validationError && <p role="alert" className="text-sm text-red-700">{validationError}</p>}
        {mutation.isError && <p role="alert" className="text-sm text-red-700">{getApiErrorMessage(mutation.error)}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={mutation.isPending} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">{mutation.isPending ? 'Saving…' : application ? 'Save changes' : 'Add application'}</button>
          <button type="button" disabled={mutation.isPending} onClick={onCancel} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50">Cancel</button>
        </div>
      </form>
    </section>
  )
}
