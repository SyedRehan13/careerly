import { Link } from 'react-router-dom'

export function Brand({ compact = false, to = '/' }: { compact?: boolean; to?: string }) {
  return (
    <Link className="brand" to={to} aria-label="Careerly home">
      <span className="brand-mark">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M17 7.5a7 7 0 1 0 1.3 7.7"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <path
            d="M12 12 20 4m-6 0h6v6"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="brand-name">
          Careerly<span className="text-brand-600">.</span>
        </span>
      )}
    </Link>
  )
}
