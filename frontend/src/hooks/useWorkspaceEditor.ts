import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// A create link opens the form immediately; closing it also clears the URL action.
export function useWorkspaceEditor<T>() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [editing, setEditing] = useState<{ record: T } | null>(null)
  const editor = editing ?? (searchParams.get('action') === 'new' ? { record: null } : null)

  function setEditor(value: { record: T | null } | null, params: Record<string, string> = {}) {
    setEditing(value?.record ? { record: value.record } : null)
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (value && value.record === null) next.set('action', 'new')
      else next.delete('action')
      for (const [key, param] of Object.entries(params)) next.set(key, param)
      return next
    }, { replace: true })
  }

  return [editor, setEditor] as const
}
