import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export function Modal({
  title,
  description,
  busy,
  onClose,
  children,
  icon: Icon,
}: {
  title: string
  description: string
  busy: boolean
  onClose: () => void
  children: ReactNode
  icon?: LucideIcon
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    const dialog = dialogRef.current
    const trigger = document.activeElement
    dialog?.showModal()
    // Focus after showModal: inputs cannot receive focus while the dialog is closed.
    dialog
      ?.querySelector<HTMLElement>('input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)')
      ?.focus({ preventScroll: true })
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus()
    }
  }, [])
  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
    >
      <div className="modal-content">
        <button
          type="button"
          className="icon-button modal-close"
          aria-label="Close form"
          disabled={busy}
          onClick={onClose}
        >
          <X size={18} />
        </button>
        {Icon && <span className="modal-heading-icon"><Icon size={22} strokeWidth={1.7} /></span>}
        <h2 className="modal-title" id={titleId}>
          {title}
        </h2>
        <p className="modal-description" id={descriptionId}>
          {description}
        </p>
        {children}
      </div>
    </dialog>
  )
}
