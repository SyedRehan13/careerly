import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from './Brand'

export function PublicMessageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="confirmation-page">
      <header className="message-header">
        <Brand />
        <Link className="text-link" to="/"><ArrowLeft size={14} /> Back home</Link>
      </header>
      <div className="message-content">
        <section className="panel confirmation-panel">{children}</section>
      </div>
      <footer className="message-footer">
        <span>© {new Date().getFullYear()} Careerly</span>
        <span>Your career. Your next chapter.</span>
      </footer>
    </main>
  )
}
