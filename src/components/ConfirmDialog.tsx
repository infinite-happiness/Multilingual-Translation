import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  children: ReactNode
  /** Label of the red confirm button. Without it the dialog only explains and has a Close button. */
  confirmLabel?: string
  onConfirm?: () => void
  onClose: () => void
}

/** A small dialog for confirming a deletion, or for explaining why something cannot be deleted. */
export function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)

  // Keeps the native dialog in step with `open`.
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="confirm-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-(--line) bg-(--surface) p-6 text-(--text) backdrop:bg-black/60"
    >
      {open && (
        <>
          <h2 id="confirm-title" className="text-lg font-medium">
            {title}
          </h2>
          <div className="mt-2 space-y-2 text-sm leading-relaxed text-(--muted)">{children}</div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-(--line) px-4 py-2 text-sm text-(--muted) hover:text-(--text)">
              {confirmLabel ? 'Cancel' : 'Close'}
            </button>
            {confirmLabel && (
              <button type="button" onClick={onConfirm} className="rounded-md bg-(--tone-red) px-4 py-2 text-sm font-medium text-(--bg)">
                {confirmLabel}
              </button>
            )}
          </div>
        </>
      )}
    </dialog>
  )
}
