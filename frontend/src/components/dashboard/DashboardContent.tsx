import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Award,
  ClipboardList,
  MessagesSquare,
  Target,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DashboardSummary } from '../../types/dashboard'
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS } from '../../types/application'
import { formatCalendarDate } from '../../utils/calendar-date'
import { CompanyMark, EmptyState, StatusBadge } from '../common/WorkspaceUI'

function Pipeline({ summary }: { summary: DashboardSummary }) {
  return (
    <section className="panel panel-padding dashboard-pipeline">
      <div className="section-heading">
        <div>
          <h2>Your application pipeline</h2>
          <p>See where you stand at every stage.</p>
        </div>
        <span className="text-xs muted">{summary.total_applications} total</span>
      </div>
      <div className="pipeline-bar" aria-hidden="true">
        {APPLICATION_STATUSES.filter((status) => summary.applications_by_status[status] > 0).map(
          (status) => (
            <span
              className={`pipeline-segment pipeline-${status}`}
              key={status}
              style={{ flexGrow: summary.applications_by_status[status] }}
            />
          ),
        )}
      </div>
      <dl className="pipeline-legend">
        {APPLICATION_STATUSES.map((status) => (
          <div key={status}>
            <dt>
              <span className={`legend-dot pipeline-${status}`} />
              <Link to={`/app/applications?status=${status}`}>{APPLICATION_STATUS_LABELS[status]}</Link>
            </dt>
            <dd>{summary.applications_by_status[status]}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function RecentApplications({
  applications,
}: {
  applications: DashboardSummary['recent_applications']
}) {
  return (
    <section className="panel dashboard-recent">
      <div className="section-heading px-6 pt-6">
        <div>
          <h2>Recent applications</h2>
          <p>Your latest moves, all in one place.</p>
        </div>
        <Link className="text-link" to="/app/applications">
          View all <ArrowUpRight size={14} />
        </Link>
      </div>
      {applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Your next chapter starts here"
          description="Add a role you've applied for to start tracking your progress."
          action={
            <Link className="btn btn-secondary btn-small" to="/app/applications?action=new">
              Track an application <ArrowRight size={14} />
            </Link>
          }
        />
      ) : (
        <ul>
          {applications.map((application) => (
            <li className="activity-row" key={application.id}>
              <CompanyMark name={application.company} />
              <div className="activity-main">
                <p className="activity-title">{application.title}</p>
                <p className="activity-company">{application.company}</p>
              </div>
              <div className="activity-aside">
                <StatusBadge status={application.status} />
                <p className="activity-date">
                  {application.applied_date
                    ? formatCalendarDate(application.applied_date)
                    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
                        new Date(application.created_at),
                      )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function FollowUps({ summary }: { summary: DashboardSummary }) {
  return (
    <section className="panel panel-padding dashboard-followups">
      <div className="section-heading">
        <div>
          <h2>Upcoming follow-ups</h2>
          <p>Follow-ups from {formatCalendarDate(summary.as_of_date)}</p>
        </div>
        <CalendarDays size={17} className="muted" />
      </div>
      {summary.upcoming_follow_ups.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="You're all caught up"
          description="No upcoming follow-ups. Add a date to an active application to plan your next move."
          action={
            <Link className="text-link" to="/app/applications">
              Manage applications <ArrowRight size={14} />
            </Link>
          }
        />
      ) : (
        <ul>
          {summary.upcoming_follow_ups.map((application) => {
            const date = application.follow_up_date
              ? new Date(`${application.follow_up_date}T00:00:00`)
              : null
            return (
              <li className="follow-up" key={application.id}>
                {date && (
                  <time className="date-tile" dateTime={application.follow_up_date!}>
                    <span>
                      {new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date)}
                    </span>
                    <strong>{date.getDate()}</strong>
                  </time>
                )}
                <div className="min-w-0">
                  <p className="activity-title">{application.company}</p>
                  <p className="activity-company">{application.title}</p>
                  <p className="mt-2 text-[10px] text-brand-600">
                    {application.follow_up_date === summary.as_of_date
                      ? 'Follow up today'
                      : 'Follow-up planned'}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export function DashboardContent({ summary }: { summary: DashboardSummary }) {
  const hasApplications = summary.total_applications > 0
  const hasSavedJobs = summary.saved_jobs_count > 0
  const hasFollowUps = summary.upcoming_follow_ups.length > 0
  const metrics = [
    { label: 'Total applications', value: summary.total_applications, icon: ClipboardList, tone: 'neutral', to: '/app/applications', detail: `${summary.active_applications} active applications` },
    { label: 'Interviewing', value: summary.applications_by_status.interviewing, icon: MessagesSquare, tone: 'neutral', to: '/app/applications?status=interviewing', detail: 'Keep the conversation going' },
    { label: 'Saved jobs', value: summary.saved_jobs_count, icon: Bookmark, tone: 'neutral', to: '/app/jobs', detail: 'Your next opportunities' },
    { label: 'Offers received', value: summary.applications_by_status.offer, icon: Award, tone: 'neutral', to: '/app/applications?status=offer', detail: 'Celebrate your progress' },
  ]
  return (
    <>
      <section className="career-banner">
        <div className="career-banner-copy">
          <p className="eyebrow">Build a career that feels like you</p>
          <h2>Your next opportunity starts<br className="desktop-break" /> with your next step.</h2>
          <p>{hasApplications ? 'You’re making progress. Keep your applications up to date and make every follow-up count.' : 'Start with a role that excites you. We’ll help you keep the details and next steps organized.'}</p>
          <Link className="banner-link" to={hasApplications ? '/app/applications' : '/app/jobs?action=new'}>
            {hasApplications ? 'Review your applications' : 'Save your first opportunity'} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="career-banner-art" aria-hidden="true">
          <div className="career-target"><Target size={66} strokeWidth={1.1} /></div>
          <span className="career-art-star">+</span>
          <span className="career-art-label"><ArrowUpRight size={16} /> Moving forward</span>
        </div>
      </section>
      <div className="stat-grid" aria-label="Job search summary">
        {metrics.map(({ label, value, icon: Icon, tone, to, detail }) => (
          <Link className="panel stat-card" to={to} key={label}>
            <div className="stat-heading">
              <span className={`stat-icon tone-${tone}`}><Icon size={19} strokeWidth={1.8} /></span>
              <ArrowUpRight size={16} className="stat-arrow" />
            </div>
            <p className="stat-value">{value}</p>
            <h2>{label}</h2>
            <p className="stat-detail">{detail}</p>
          </Link>
        ))}
      </div>
      <div className="dashboard-columns">
        <div className="page-stack">
          <Pipeline summary={summary} />
          <RecentApplications applications={summary.recent_applications} />
        </div>
        <div className="page-stack">
          <FollowUps summary={summary} />
          <section className="next-step">
            <span className="next-step-icon"><Target size={19} /></span>
            <p className="eyebrow">Your next step</p>
            <h2>
              {hasFollowUps
                ? 'Keep the conversation going.'
                : hasApplications
                  ? 'Keep your progress up to date.'
                  : hasSavedJobs
                    ? 'Ready to apply?'
                    : 'Build your shortlist.'}
            </h2>
            <p>
              {hasFollowUps
                ? 'A thoughtful follow-up can make a difference. Review what is coming up and plan your next message.'
                : hasApplications
                  ? 'Update your application stages and leave a note for your future self.'
                  : hasSavedJobs
                    ? 'Found a role worth going for? Track your application and keep the details close.'
                    : 'Save an opportunity that interests you. You can come back to the details when you are ready.'}
            </p>
            <Link
              className="text-link"
              to={hasApplications ? '/app/applications' : hasSavedJobs ? '/app/applications?action=new' : '/app/jobs?action=new'}
            >
              {hasApplications
                ? 'Review applications'
                : hasSavedJobs
                  ? 'Track an application'
                  : 'Save an opportunity'}
              <ArrowRight size={15} />
            </Link>
          </section>
        </div>
      </div>
    </>
  )
}
