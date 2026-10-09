import type { LucideIcon } from 'lucide-react'
import { ArrowRight, ArrowUpRight, Clock3, Lightbulb } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from './PageHeader'

interface FeaturePlaceholderProps {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  panelTitle: string
  panelDescription: string
  features: { title: string; description: string }[]
  guideTitle: string
  steps: { title: string; description: string }[]
  actionLabel: string
  actionTo: string
  kind: 'resume' | 'interview'
}

export function FeaturePlaceholder({
  icon: Icon,
  eyebrow,
  title,
  description,
  panelTitle,
  panelDescription,
  features,
  guideTitle,
  steps,
  actionLabel,
  actionTo,
  kind,
}: FeaturePlaceholderProps) {
  return (
    <div className={`page-stack workspace-page workspace-page--${kind}`}>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <section className="panel feature-layout career-tool-hero">
        <div>
          <span className="empty-icon">
            <Icon size={25} strokeWidth={1.5} />
          </span>
          <span className="status-badge tool-coming-soon"><Clock3 size={12} /> Coming soon</span>
          <h2>{panelTitle}</h2>
          <p>{panelDescription}</p>
          <Link className="btn btn-secondary mt-7" to={actionTo}>
            {actionLabel} <ArrowRight size={15} />
          </Link>
        </div>
        <div className="feature-preview">
          <p className="eyebrow mb-3">What we're working toward</p>
          {features.map((feature, index) => (
            <div className="feature-preview-item" key={feature.title}>
              <span className="tool-feature-number">0{index + 1}</span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
          <p className="mt-4 text-[10px]">Planned features · Not available yet</p>
        </div>
      </section>
      <section className="tool-guide" aria-label="Preparation guide">
        <div className="section-heading">
          <div><p className="eyebrow">Make a start today</p><h2>{guideTitle}</h2></div>
          <Lightbulb size={20} className="muted" />
        </div>
        <div className="tool-guide-grid">
          {steps.map((step, index) => (
            <article className="panel guide-card" key={step.title}>
              <span className="guide-number">0{index + 1}</span>
              <h3>{step.title}</h3><p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>
      <aside className="workspace-tip">
        <span className="tip-icon"><Icon size={20} /></span>
        <div><h2>Keep your next step in sight.</h2><p>Your saved roles and application notes are ready whenever you are.</p></div>
        <Link className="text-link" to="/app/applications">Open applications <ArrowUpRight size={15} /></Link>
      </aside>
    </div>
  )
}
