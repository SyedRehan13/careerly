import {
  ArrowRight, ArrowUpRight, Bookmark, CalendarDays, Check,
  ClipboardList, LayoutDashboard, MessagesSquare, Target,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/common/Brand'

const features = [
  {
    icon: Bookmark,
    title: 'A shortlist worth coming back to.',
    description: 'Save interesting roles from any job board. Keep links, company details, and notes together until you’re ready to apply.',
    label: 'Save opportunities',
  },
  {
    icon: ClipboardList,
    title: 'Every application. One clear view.',
    description: 'Follow your applications from the first click to the final offer. See what’s moving and what needs your attention.',
    label: 'Track your progress',
  },
  {
    icon: CalendarDays,
    title: 'Always know what comes next.',
    description: 'Set follow-up dates and keep your conversation notes close. Make your next move with the details in front of you.',
    label: 'Plan your next step',
  },
]

function WorkspacePreview() {
  return (
    <div className="hero-art" aria-label="An illustrative preview of a Careerly workspace">
      <div className="preview-window">
        <div className="preview-topbar">
          <div className="preview-dots" aria-hidden="true"><i /><i /><i /></div>
          <span>Careerly workspace</span>
          <span className="preview-label">Preview</span>
        </div>
        <div className="preview-body">
          <div className="preview-rail" aria-hidden="true">
            <span className="preview-rail-active"><LayoutDashboard size={18} /></span>
            <span><ClipboardList size={18} /></span>
            <span><Bookmark size={18} /></span>
            <span><MessagesSquare size={18} /></span>
          </div>
          <div className="preview-content">
            <p className="eyebrow">Your next chapter</p>
            <h2>A little focus. A lot of possibility.</h2>
            <div className="preview-banner">
              <div><span>Your next move is a great one.</span><p>Let’s make it happen.</p></div>
              <Target size={36} strokeWidth={1.4} />
            </div>
            <div className="preview-metrics">
              <div><strong>3</strong><span>Applications</span></div>
              <div><strong>1</strong><span>Interview</span></div>
              <div><strong>1</strong><span>Offer</span></div>
            </div>
            <div className="preview-list-heading"><h3>Recent applications</h3><span>Sample workspace</span></div>
            {[
              { initials: 'DS', role: 'Product designer', company: 'Design studio', status: 'Interviewing', tone: 'interviewing' },
              { initials: 'TL', role: 'Frontend engineer', company: 'Technology lab', status: 'Applied', tone: 'applied' },
              { initials: 'PC', role: 'Product manager', company: 'Product company', status: 'Offer', tone: 'offer' },
            ].map(({ initials, role, company, status, tone }) => (
              <div className="preview-application" key={role}>
                <span className="company-mark tone-neutral">{initials}</span>
                <div><h4>{role}</h4><p>{company}</p></div>
                <span className={`status-badge status-${tone}`}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="preview-float"><span><Check size={17} /></span><div><strong>A clearer path forward</strong><p>One organized workspace. Yours.</p></div></div>
    </div>
  )
}

export function LandingPage() {
  return (
    <div>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="public-header">
        <Brand />
        <a className="public-how-link" href="#how-it-works">How it works</a>
        <nav className="public-nav" aria-label="Public navigation">
          <Link className="btn btn-ghost" to="/login">Log in</Link>
          <Link className="btn btn-primary" to="/signup">Get started <ArrowUpRight size={15} /></Link>
        </nav>
      </header>
      <main id="main-content">
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="hero-kicker"><span className="status-dot" /> Your career. A clearer direction.</p>
            <h1>Your next<br />career move.<br /><em>With confidence.</em></h1>
            <p className="hero-description">Big ambitions deserve a clear plan. Bring your saved jobs, applications, and follow-ups into one workspace built around you.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/signup">Build your next chapter <ArrowRight size={17} /></Link>
              <a className="btn btn-secondary" href="#how-it-works">See how it works</a>
            </div>
            <div className="hero-reassurance"><span><Check size={14} /> Easy to get started</span><span><Check size={14} /> Built for your job search</span></div>
          </div>
          <WorkspacePreview />
        </section>
        <section className="landing-features" id="how-it-works">
          <div className="features-heading">
            <div><p className="eyebrow">A little structure. A lot more confidence.</p><h2>Your search, made simpler.</h2></div>
            <p>Less time keeping track.<br />More energy for what comes next.</p>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, description, label }, index) => (
              <article key={title}>
                <div className="feature-card-top"><span className="feature-icon"><Icon size={22} strokeWidth={1.7} /></span><span className="feature-number">0{index + 1}</span></div>
                <h3>{title}</h3><p>{description}</p>
                <Link className="text-link" to="/signup">{label}<ArrowRight size={15} /></Link>
              </article>
            ))}
          </div>
        </section>
        <section className="landing-cta">
          <div><p className="eyebrow">Your future is worth a little focus</p><h2>Ready for your next chapter?</h2><p>Make room for the opportunities ahead.</p></div>
          <Link className="btn btn-primary" to="/signup">Create your workspace <ArrowRight size={17} /></Link>
        </section>
      </main>
      <footer className="public-footer"><span>© {new Date().getFullYear()} Careerly</span><span>Your career. Your next chapter.</span></footer>
    </div>
  )
}
