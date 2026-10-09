import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ExternalLink, FileText, LoaderCircle, Trash2, Upload } from 'lucide-react'

import { supabase } from '../../lib/supabase'

const bucketName = 'careerly-cvs'
const maxFileSize = 10 * 1024 * 1024
const acceptedTypes: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

interface UploadedCv {
  name: string
  size: number
  updatedAt: string | null
}

function formatFileSize(size: number) {
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatUploadDate(value: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

export function ResumeCvUpload({ userId }: { userId: string }) {
  const [uploadedCv, setUploadedCv] = useState<UploadedCv | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [isViewing, setIsViewing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadUploadedCv() {
      if (!supabase) {
        if (isActive) {
          setError('CV storage is unavailable because Supabase is not configured.')
          setIsLoading(false)
        }
        return
      }

      try {
        const { data, error: storageError } = await supabase.storage
          .from(bucketName)
          .list(userId, { limit: 10, search: 'cv' })

        if (!isActive) return
        if (storageError) {
          setError('Could not load your CV. Apply the latest database migration and try again.')
        } else {
          const file = data.find((item) => item.name === 'cv')
          if (file) {
            setUploadedCv({
              name: typeof file.metadata?.originalName === 'string' ? file.metadata.originalName : 'Uploaded CV',
              size: typeof file.metadata?.size === 'number' ? file.metadata.size : 0,
              updatedAt: file.updated_at,
            })
          }
        }
      } catch {
        if (isActive) setError('Could not load your CV. Please check your connection and try again.')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void loadUploadedCv()
    return () => { isActive = false }
  }, [userId])

  async function uploadCv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError(null)
    setNotice(null)
    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    const contentType = acceptedTypes[extension]
    if (!contentType) {
      setError('Choose a PDF, DOC, or DOCX file.')
      return
    }
    if (file.size === 0 || file.size > maxFileSize) {
      setError('Choose a file smaller than 10 MB.')
      return
    }
    if (!supabase) {
      setError('CV storage is unavailable because Supabase is not configured.')
      return
    }

    setIsBusy(true)
    try {
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(
        `${userId}/cv`,
        file,
        {
          cacheControl: '0',
          contentType,
          upsert: true,
          metadata: { originalName: file.name },
        },
      )
      if (uploadError) throw uploadError

      setUploadedCv({ name: file.name, size: file.size, updatedAt: new Date().toISOString() })
      setNotice('Your CV is uploaded and stored privately. Resume analysis is coming later.')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload your CV. Please try again.')
    } finally {
      setIsBusy(false)
    }
  }

  async function removeCv() {
    if (!supabase) return
    setError(null)
    setNotice(null)
    setIsBusy(true)
    try {
      const { error: removeError } = await supabase.storage.from(bucketName).remove([`${userId}/cv`])
      if (removeError) throw removeError
      setUploadedCv(null)
      setNotice('Your uploaded CV has been removed.')
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Could not remove your CV. Please try again.')
    } finally {
      setIsBusy(false)
    }
  }

  async function viewCv() {
    if (!supabase || !uploadedCv) return
    setError(null)
    const tab = window.open('', '_blank')
    if (!tab) {
      setError('Allow pop-ups for Careerly to view your CV in a new tab.')
      return
    }
    tab.opener = null
    setIsViewing(true)
    try {
      const { data, error: viewError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(`${userId}/cv`, 60)
      if (viewError || !data?.signedUrl) throw viewError ?? new Error('Could not open your CV.')
      tab.location.replace(data.signedUrl)
    } catch {
      tab.close()
      setError('Could not open your CV. Please try again.')
    } finally {
      setIsViewing(false)
    }
  }

  return (
    <section className="panel panel-padding resume-cv-card resume-print-hide" aria-labelledby="resume-cv-title">
      <div className="resume-cv-main">
        <span className="empty-icon"><FileText size={22} /></span>
        <div className="min-w-0">
          <h2 id="resume-cv-title">Upload your existing CV</h2>
          <p className="text-sm muted mt-1">Keep a private copy here. PDF, DOC, or DOCX up to 10 MB.</p>
        </div>
      </div>

      {uploadedCv ? (
        <div className="resume-cv-file">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{uploadedCv.name}</p>
            <p className="text-xs muted mt-1">
              {uploadedCv.size ? formatFileSize(uploadedCv.size) : 'CV uploaded'}
              {formatUploadDate(uploadedCv.updatedAt) && ` · Uploaded ${formatUploadDate(uploadedCv.updatedAt)}`}
            </p>
          </div>
          <div className="resume-cv-actions">
            <button className="btn btn-secondary btn-small" type="button" onClick={() => void viewCv()} disabled={isBusy || isViewing}>
              {isViewing ? <LoaderCircle className="animate-spin" size={15} /> : <ExternalLink size={15} />}
              {isViewing ? 'Opening…' : 'View CV'}
            </button>
            <button className="icon-button" type="button" onClick={() => void removeCv()} disabled={isBusy || isViewing} aria-label="Remove uploaded CV" title="Remove CV">
              {isBusy ? <LoaderCircle className="animate-spin" size={16} /> : <Trash2 size={16} />}
            </button>
          </div>
        </div>
      ) : (
        <label className="btn btn-secondary resume-cv-upload-button" aria-disabled={!supabase || isBusy || isLoading}>
          {isBusy || isLoading ? <LoaderCircle className="animate-spin" size={15} /> : <Upload size={15} />}
          {isLoading ? 'Checking for a CV…' : isBusy ? 'Uploading…' : 'Choose a file'}
          <input
            className="sr-only"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => void uploadCv(event)}
            disabled={!supabase || isBusy || isLoading}
            aria-label="Choose a CV file to upload"
          />
        </label>
      )}

      {uploadedCv && !isBusy && (
        <label className="text-link resume-cv-replace">
          Replace CV
          <input
            className="sr-only"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => void uploadCv(event)}
            aria-label="Choose a replacement CV file"
          />
        </label>
      )}
      {error && <p className="notice notice-error resume-cv-message" role="alert">{error}</p>}
      {notice && <p className="notice resume-cv-message" role="status">{notice}</p>}
    </section>
  )
}
