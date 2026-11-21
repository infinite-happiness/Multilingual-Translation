import { useEffect, useRef } from 'react'
import { BackupPanel } from '../backup/BackupPanel'

interface Props {
  open: boolean
  onClose: () => void
}

export function BackupDialog({ open, onClose }: Props) {
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
      onClick={(e) => e.target === dialog.current && onClose()}
      aria-labelledby="backup-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-(--line) bg-(--surface) p-6 text-(--text) backdrop:bg-black/60"
    >
      <h2 id="backup-title" className="mb-2 text-lg font-medium">Back up your translations</h2>
      {/* Mounted only while open, so the backup is generated fresh each time. */}
      {open && <BackupPanel />}
      <div className="mt-5 flex justify-end">
        <button type="button" onClick={onClose} className="rounded-md border border-(--line) px-4 py-2 text-sm text-(--muted) hover:text-(--text)">
          Close
        </button>
      </div>
    </dialog>
  )
}
