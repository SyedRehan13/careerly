import { Mail, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../components/common/PageHeader'
import { ProfileSection } from '../components/profile/ProfileSection'
import { useAuth } from '../hooks/useAuth'

export function ProfilePage() {
  const { user } = useAuth()
  const fullName =
    typeof user?.user_metadata.full_name === 'string'
      ? user.user_metadata.full_name
      : 'Careerly member'
  const joinedAt = user?.created_at
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(user.created_at))
    : 'Not available'
  return (
    <div className="page-stack workspace-page workspace-page--profile">
      <PageHeader
        eyebrow="Personal workspace"
        title="Your profile"
        description="Put your experience, strengths, and next career move into words."
      />
      <div className="profile-layout">
        <ProfileSection />
        <aside className="page-stack">
          <section className="panel">
            <div className="profile-cover" />
            <div className="profile-account">
              <span className="avatar profile-avatar">
                {fullName.trim().slice(0, 1).toUpperCase() || 'C'}
              </span>
              <h2 className="mt-3 text-lg font-semibold tracking-tight">{fullName}</h2>
              <p className="text-xs muted mt-1">Your Careerly account</p>
              <dl>
                <div>
                  <dt>Email address</dt>
                  <dd className="flex items-start gap-2">
                    <Mail size={14} className="shrink-0 mt-0.5 muted" />
                    {user?.email}
                  </dd>
                </div>
                <div>
                  <dt>Member since</dt>
                  <dd>{joinedAt}</dd>
                </div>
                <div>
                  <dt>Email verification</dt>
                  <dd>{user?.email_confirmed_at ? 'Confirmed' : 'Confirmation pending'}</dd>
                </div>
              </dl>
            </div>
            <p className="profile-footer">
              Career profile edits are saved separately from your account name and email.
            </p>
          </section>
          <div className="flex items-start gap-3 px-2">
            <ShieldCheck size={20} className="text-brand-600 shrink-0" />
            <div>
              <h2 className="text-xs font-semibold">Your own corner of Careerly</h2>
              <p className="text-xs muted leading-6 mt-1">
                Your profile, saved jobs, and applications belong to your account.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
