import { ArrowRight, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PublicMessageLayout } from '../components/common/PublicMessageLayout'

export function NotFoundPage() {
  return (
    <PublicMessageLayout>
        <p className="error-code" aria-hidden="true">404<span>.</span></p>
        <p className="eyebrow">Page not found</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-4">Let's find your way back.</h1>
        <p className="text-sm muted leading-7 mt-4">
          This page doesn't exist, or it may have moved. Your next chapter is still waiting.
        </p>
        <div className="message-actions">
          <Link className="btn btn-primary" to="/">Back to Careerly <ArrowRight size={15} /></Link>
          <Link className="btn btn-secondary" to="/app"><LayoutDashboard size={15} /> Open workspace</Link>
        </div>
    </PublicMessageLayout>
  )
}
