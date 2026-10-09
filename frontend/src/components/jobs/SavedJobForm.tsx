import { Modal } from '../common/Modal'
import { Bookmark } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { getApiErrorMessage } from '../../services/api'
import { createSavedJob, updateSavedJob } from '../../services/saved-jobs'
import type { SavedJob, SavedJobInput } from '../../types/saved-job'

interface SavedJobFormProps {
  userId: string
  job: SavedJob | null
  onSaved: (job: SavedJob) => Promise<void>
  onCancel: () => void
}

const inputClass = 'field'

export function SavedJobForm({ userId, job, onSaved, onCancel }: SavedJobFormProps) {
  const [title, setTitle] = useState(job?.title ?? '')
  const [company, setCompany] = useState(job?.company ?? '')
  const [location, setLocation] = useState(job?.location ?? '')
  const [jobUrl, setJobUrl] = useState(job?.job_url ?? '')
  const [description, setDescription] = useState(job?.description ?? '')
  const [validationError, setValidationError] = useState('')
  const mutation = useMutation({
    mutationFn: (input: SavedJobInput) =>
      job ? updateSavedJob(userId, job.id, input) : createSavedJob(userId, input),
    onSuccess: onSaved,
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending) return
    setValidationError('')
    mutation.reset()
    if (!title.trim() || !company.trim()) {
      setValidationError('Enter a job title and company name.')
      return
    }
    if (jobUrl.trim()) {
      try {
        const url = new URL(jobUrl.trim())
        if (url.protocol !== 'http:' && url.protocol !== 'https:')
          throw new Error('Unsupported URL')
      } catch {
        setValidationError('Enter a complete job link starting with http:// or https://.')
        return
      }
    }
    mutation.mutate({
      title: title.trim(),
      company: company.trim(),
      location: location.trim() || null,
      job_url: jobUrl.trim() || null,
      description: description.trim() || null,
    })
  }

  return (
    <Modal
      icon={Bookmark}
      title={job ? 'Edit saved job' : 'Save an opportunity'}
      description="Found a role worth a closer look? Keep it here for when you're ready. Fields marked * are required."
      busy={mutation.isPending}
      onClose={onCancel}
    >
      <form className="mt-6 space-y-5" onSubmit={submit}>
        <fieldset disabled={mutation.isPending} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field-label" htmlFor="job-title">
              Job title <span aria-hidden="true">*</span>
              <input
                id="job-title"
                className={inputClass}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={200}
              />
            </label>
            <label className="field-label" htmlFor="job-company">
              Company <span aria-hidden="true">*</span>
              <input
                id="job-company"
                className={inputClass}
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                required
                maxLength={200}
              />
            </label>
          </div>
          <label className="field-label" htmlFor="job-location">
            Location
            <input
              id="job-location"
              className={inputClass}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={200}
              placeholder="City, country or remote"
            />
          </label>
          <label className="field-label" htmlFor="job-url">
            Job link
            <input
              id="job-url"
              className={inputClass}
              value={jobUrl}
              onChange={(event) => setJobUrl(event.target.value)}
              type="url"
              maxLength={2048}
              placeholder="https://example.com/jobs/role"
            />
          </label>
          <label className="field-label" htmlFor="job-description">
            Description
            <textarea
              id="job-description"
              className={inputClass}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              maxLength={20000}
            />
            <span className="field-help">
              {description.length.toLocaleString()}/20,000 characters
            </span>
          </label>
        </fieldset>
        {validationError && (
          <p role="alert" className="notice notice-error">
            {validationError}
          </p>
        )}
        {mutation.isError && (
          <p role="alert" className="notice notice-error">
            {getApiErrorMessage(mutation.error)}
          </p>
        )}
        <div className="form-actions">
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary">
            {mutation.isPending ? 'Saving…' : job ? 'Save changes' : 'Save job'}
          </button>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
