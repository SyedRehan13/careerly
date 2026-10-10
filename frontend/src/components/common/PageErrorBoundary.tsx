import { Component } from 'react'
import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { Brand } from './Brand'

export class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="confirmation-page">
        <Brand />
        <section className="panel confirmation-panel" role="alert">
          <span className="empty-icon mx-auto">
            <RefreshCw size={24} />
          </span>
          <p className="eyebrow">A little interruption</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-4">Let's give that another try.</h1>
          <p className="text-sm muted leading-7 mt-4">
            This page couldn't load properly. Refresh to reopen your workspace. Anything you've
            already saved will still be there.
          </p>
          <button
            className="btn btn-primary mt-7"
            type="button"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={15} />
            Refresh page
          </button>
        </section>
      </main>
    )
  }
}
