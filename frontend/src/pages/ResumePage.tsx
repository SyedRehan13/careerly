import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Printer, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'

import { ErrorState, LoadingState, SuccessNotice } from '../components/common/WorkspaceUI'
import { PageHeader } from '../components/common/PageHeader'
import { ResumeCvUpload } from '../components/resume/ResumeCvUpload'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../services/api'
import { getResume, resumeQueryKey, saveResume } from '../services/resume'
import type { ResumeContent, ResumeEducation, ResumeExperience, ResumeResponse } from '../types/resume'
import '../styles/resume.css'

const emptyResume: ResumeContent = {
  full_name: '', email: '', phone: '', location: '', website: '', linkedin: '', summary: '',
  skills: [], experience: [], education: [],
}

function toResumeDraft(resume: ResumeResponse, accountEmail?: string, accountName?: string): ResumeContent {
  return {
    ...emptyResume,
    ...resume.content,
    full_name: resume.content.full_name || accountName || '',
    email: resume.content.email || accountEmail || '',
    skills: [...resume.content.skills],
    experience: resume.content.experience.map((item) => ({ ...item })),
    education: resume.content.education.map((item) => ({ ...item })),
  }
}

function newExperience(): ResumeExperience {
  return { id: crypto.randomUUID(), role: '', company: '', location: '', start_date: '', end_date: '', description: '' }
}

function newEducation(): ResumeEducation {
  return { id: crypto.randomUUID(), institution: '', qualification: '', field_of_study: '', start_date: '', end_date: '', description: '' }
}

const fieldClass = 'field'
type SimpleResumeField = Exclude<keyof ResumeContent, 'skills' | 'experience' | 'education'>

function ResumeEditor({
  content,
  onChange,
}: {
  content: ResumeContent
  onChange: (content: ResumeContent) => void
}) {
  const [skillsInput, setSkillsInput] = useState(content.skills.join(', '))

  function updateField(field: SimpleResumeField, value: string) {
    onChange({ ...content, [field]: value })
  }

  function updateExperience(id: string, field: keyof ResumeExperience, value: string) {
    onChange({
      ...content,
      experience: content.experience.map((item) => item.id === id ? { ...item, [field]: value } : item),
    })
  }

  function updateEducation(id: string, field: keyof ResumeEducation, value: string) {
    onChange({
      ...content,
      education: content.education.map((item) => item.id === id ? { ...item, [field]: value } : item),
    })
  }

  function setSkills(event: ChangeEvent<HTMLInputElement>) {
    setSkillsInput(event.target.value)
    onChange({
      ...content,
      skills: event.target.value.split(',').map((skill) => skill.trim()).filter(Boolean).slice(0, 40),
    })
  }

  return (
    <div className="panel panel-padding space-y-7">
      <section className="space-y-4">
        <div className="section-heading"><div><h2>Contact details</h2><p>How employers can reach you.</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field-label">Full name<input className={fieldClass} value={content.full_name} maxLength={200} autoComplete="name" onChange={(event) => updateField('full_name', event.target.value)} /></label>
          <label className="field-label">Email<input className={fieldClass} type="email" value={content.email} maxLength={320} autoComplete="email" onChange={(event) => updateField('email', event.target.value)} /></label>
          <label className="field-label">Phone<input className={fieldClass} type="tel" value={content.phone} maxLength={80} autoComplete="tel" onChange={(event) => updateField('phone', event.target.value)} /></label>
          <label className="field-label">Location<input className={fieldClass} value={content.location} maxLength={200} autoComplete="address-level2" placeholder="City, country or remote" onChange={(event) => updateField('location', event.target.value)} /></label>
          <label className="field-label">Website<input className={fieldClass} type="url" value={content.website} maxLength={2048} placeholder="https://your-site.com" onChange={(event) => updateField('website', event.target.value)} /></label>
          <label className="field-label">LinkedIn<input className={fieldClass} type="url" value={content.linkedin} maxLength={2048} placeholder="https://linkedin.com/in/you" onChange={(event) => updateField('linkedin', event.target.value)} /></label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="section-heading"><div><h2>Professional summary</h2><p>A short introduction to your strengths and direction.</p></div></div>
        <textarea className={fieldClass} rows={5} maxLength={20_000} value={content.summary} onChange={(event) => updateField('summary', event.target.value)} placeholder="Describe your experience, strengths, and the work you want to do next." />
      </section>

      <section className="space-y-4">
        <div className="section-heading">
          <div><h2>Experience</h2><p>Focus on what you contributed and achieved.</p></div>
          <button className="btn btn-secondary btn-small" type="button" disabled={content.experience.length >= 20} onClick={() => onChange({ ...content, experience: [...content.experience, newExperience()] })}><Plus size={14} /> Add role</button>
        </div>
        {content.experience.map((item, index) => (
          <fieldset className="resume-entry" key={item.id}>
            <legend className="resume-entry-heading">Role {index + 1}</legend>
            <button className="icon-button resume-entry-remove" type="button" aria-label={`Remove role ${index + 1}`} onClick={() => onChange({ ...content, experience: content.experience.filter((entry) => entry.id !== item.id) })}><Trash2 size={15} /></button>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field-label">Job title<input className={fieldClass} value={item.role} maxLength={200} onChange={(event) => updateExperience(item.id, 'role', event.target.value)} /></label>
              <label className="field-label">Company<input className={fieldClass} value={item.company} maxLength={200} onChange={(event) => updateExperience(item.id, 'company', event.target.value)} /></label>
              <label className="field-label">Location<input className={fieldClass} value={item.location} maxLength={200} onChange={(event) => updateExperience(item.id, 'location', event.target.value)} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="field-label">From<input className={fieldClass} value={item.start_date} maxLength={40} placeholder="Jan 2023" onChange={(event) => updateExperience(item.id, 'start_date', event.target.value)} /></label>
                <label className="field-label">To<input className={fieldClass} value={item.end_date} maxLength={40} placeholder="Present" onChange={(event) => updateExperience(item.id, 'end_date', event.target.value)} /></label>
              </div>
              <label className="field-label sm:col-span-2">Highlights<textarea className={fieldClass} rows={4} maxLength={20_000} value={item.description} onChange={(event) => updateExperience(item.id, 'description', event.target.value)} placeholder="Use a new line for each accomplishment." /></label>
            </div>
          </fieldset>
        ))}
        {content.experience.length === 0 && <p className="text-sm muted">Add your most recent role first.</p>}
      </section>

      <section className="space-y-4">
        <div className="section-heading">
          <div><h2>Education</h2><p>Include qualifications relevant to your goals.</p></div>
          <button className="btn btn-secondary btn-small" type="button" disabled={content.education.length >= 20} onClick={() => onChange({ ...content, education: [...content.education, newEducation()] })}><Plus size={14} /> Add education</button>
        </div>
        {content.education.map((item, index) => (
          <fieldset className="resume-entry" key={item.id}>
            <legend className="resume-entry-heading">Education {index + 1}</legend>
            <button className="icon-button resume-entry-remove" type="button" aria-label={`Remove education ${index + 1}`} onClick={() => onChange({ ...content, education: content.education.filter((entry) => entry.id !== item.id) })}><Trash2 size={15} /></button>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field-label">School or institution<input className={fieldClass} value={item.institution} maxLength={200} onChange={(event) => updateEducation(item.id, 'institution', event.target.value)} /></label>
              <label className="field-label">Qualification<input className={fieldClass} value={item.qualification} maxLength={200} placeholder="Bachelor of Science" onChange={(event) => updateEducation(item.id, 'qualification', event.target.value)} /></label>
              <label className="field-label">Field of study<input className={fieldClass} value={item.field_of_study} maxLength={200} onChange={(event) => updateEducation(item.id, 'field_of_study', event.target.value)} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="field-label">From<input className={fieldClass} value={item.start_date} maxLength={40} placeholder="2020" onChange={(event) => updateEducation(item.id, 'start_date', event.target.value)} /></label>
                <label className="field-label">To<input className={fieldClass} value={item.end_date} maxLength={40} placeholder="2024" onChange={(event) => updateEducation(item.id, 'end_date', event.target.value)} /></label>
              </div>
              <label className="field-label sm:col-span-2">Details<textarea className={fieldClass} rows={3} maxLength={20_000} value={item.description} onChange={(event) => updateEducation(item.id, 'description', event.target.value)} /></label>
            </div>
          </fieldset>
        ))}
      </section>

      <section className="space-y-3">
        <div className="section-heading"><div><h2>Skills</h2><p>Separate skills with commas.</p></div></div>
        <input className={fieldClass} value={skillsInput} maxLength={3_200} placeholder="Project management, SQL, user research" onChange={setSkills} onBlur={() => setSkillsInput(content.skills.join(', '))} />
      </section>
    </div>
  )
}

function ResumePreview({ content }: { content: ResumeContent }) {
  const contact = [content.email, content.phone, content.location, content.website, content.linkedin].filter(Boolean)
  const experience = content.experience.filter((item) => item.role || item.company || item.description)
  const education = content.education.filter((item) => item.institution || item.qualification || item.description)

  return (
    <article className="resume-paper resume-print-area">
      <header className="resume-paper-header">
        <h2>{content.full_name || 'Your name'}</h2>
        {contact.length > 0 && <p>{contact.join('  ·  ')}</p>}
      </header>
      {content.summary && <section><h3>Professional summary</h3><p className="resume-summary">{content.summary}</p></section>}
      {experience.length > 0 && <section><h3>Experience</h3>{experience.map((item) => <article className="resume-preview-entry" key={item.id}>
        <div className="resume-preview-heading"><div><h4>{item.role || 'Role'}</h4><p>{[item.company, item.location].filter(Boolean).join(' · ')}</p></div><span>{[item.start_date, item.end_date].filter(Boolean).join(' – ')}</span></div>
        {item.description && <p className="resume-summary">{item.description}</p>}
      </article>)}</section>}
      {education.length > 0 && <section><h3>Education</h3>{education.map((item) => <article className="resume-preview-entry" key={item.id}>
        <div className="resume-preview-heading"><div><h4>{item.qualification || item.institution || 'Education'}</h4><p>{[item.institution, item.field_of_study].filter(Boolean).join(' · ')}</p></div><span>{[item.start_date, item.end_date].filter(Boolean).join(' – ')}</span></div>
        {item.description && <p className="resume-summary">{item.description}</p>}
      </article>)}</section>}
      {content.skills.length > 0 && <section><h3>Skills</h3><p className="resume-skills">{content.skills.join(' · ')}</p></section>}
      {!content.summary && experience.length === 0 && education.length === 0 && content.skills.length === 0 && <p className="resume-preview-empty">Your resume preview will take shape as you add details.</p>}
    </article>
  )
}

function ResumeEditorWorkspace({
  userId,
  resume,
  accountEmail,
  accountName,
  onSaved,
}: {
  userId: string
  resume: ResumeResponse
  accountEmail?: string
  accountName?: string
  onSaved: (resume: ResumeResponse) => void
}) {
  const [draft, setDraft] = useState(() => toResumeDraft(resume, accountEmail, accountName))
  const baseline = toResumeDraft(resume, accountEmail, accountName)
  const mutation = useMutation({
    mutationFn: (content: ResumeContent) => saveResume(userId, content),
    onSuccess: (saved) => {
      onSaved(saved)
      setDraft(toResumeDraft(saved, accountEmail, accountName))
    },
  })
  const isDirty = JSON.stringify(draft) !== JSON.stringify(baseline)

  return (
    <div className="page-stack workspace-page workspace-page--resume">
      <PageHeader
        eyebrow="Tell your story"
        title="Resume workspace"
        description="Build a clear, considered resume and keep it ready for your next opportunity."
        action={<button className="btn btn-secondary" type="button" onClick={() => window.print()}><Printer size={15} /> Export PDF</button>}
      />
      <ResumeCvUpload userId={userId} />
      <div className="resume-workspace-grid">
        <section className="space-y-4 resume-print-hide" aria-label="Resume editor">
          <div className="section-heading"><div><h2>Your information</h2><p>Changes stay private to your Careerly account.</p></div></div>
          <fieldset className="resume-editor-fieldset" aria-label="Resume details" disabled={mutation.isPending}>
            <ResumeEditor content={draft} onChange={(content) => { setDraft(content); mutation.reset() }} />
          </fieldset>
          {mutation.isError && <p className="notice notice-error" role="alert">{getApiErrorMessage(mutation.error)}</p>}
          {mutation.isSuccess && <SuccessNotice>Your resume is saved.</SuccessNotice>}
          <div className="form-actions">
            <span className="save-state" role="status">{mutation.isPending ? 'Saving your resume…' : isDirty ? 'You have unsaved changes' : resume.updated_at ? 'All changes saved' : 'Save your details to keep them here'}</span>
            <button className="btn btn-primary" type="button" disabled={!isDirty || mutation.isPending} onClick={() => mutation.mutate(draft)}>{mutation.isPending ? 'Saving…' : 'Save resume'}</button>
          </div>
        </section>
        <section className="resume-preview-section" aria-label="Resume preview">
          <div className="section-heading resume-print-hide"><div><p className="eyebrow">Live preview</p><h2>Your resume</h2></div></div>
          <ResumePreview content={draft} />
        </section>
      </div>
    </div>
  )
}

function ResumeWorkspace({ userId, accountEmail, accountName }: { userId: string; accountEmail?: string; accountName?: string }) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: resumeQueryKey(userId),
    queryFn: ({ signal }) => getResume(userId, signal),
    retry: false,
    gcTime: 0,
  })

  if (query.isPending) return <LoadingState label="Loading your resume" />
  if (query.isError || !query.data) {
    return <ErrorState message={getApiErrorMessage(query.error)} retry={() => void query.refetch()} busy={query.isFetching} />
  }

  return <ResumeEditorWorkspace
    key={userId}
    userId={userId}
    resume={query.data}
    accountEmail={accountEmail}
    accountName={accountName}
    onSaved={(saved) => queryClient.setQueryData(resumeQueryKey(userId), saved)}
  />
}

export function ResumePage() {
  const { user } = useAuth()
  if (!user) return null

  const accountName = typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : ''
  return <ResumeWorkspace key={user.id} userId={user.id} accountEmail={user.email} accountName={accountName} />
}
