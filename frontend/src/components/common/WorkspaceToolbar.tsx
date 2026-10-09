import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

export function WorkspaceToolbar({
  title,
  description,
  search,
  onSearch,
  searchLabel,
  children,
}: {
  title: string
  description: string
  search: string
  onSearch: (value: string) => void
  searchLabel: string
  children?: ReactNode
}) {
  return (
    <section className="panel workspace-controls" aria-label={`${title} controls`}>
      <div className="workspace-controls-main">
        <div>
          <h2>{title}</h2>
          <p aria-live="polite">{description}</p>
        </div>
        <label className="search-field">
          <span className="sr-only">{searchLabel}</span>
          <Search size={17} aria-hidden="true" />
          <input
            className="field"
            type="search"
            placeholder={searchLabel}
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
        </label>
      </div>
      {children && <div className="workspace-controls-filters">{children}</div>}
    </section>
  )
}
