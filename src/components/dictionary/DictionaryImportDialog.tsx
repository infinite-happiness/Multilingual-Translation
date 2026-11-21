import { useEffect, useRef } from 'react'
import { ImportEditor } from './ImportEditor'

interface Props {
  open: boolean
  language: string
  onClose: () => void
}

/** Dialog for importing words into a dictionary. Escape or Cancel closes it without importing. */
export function DictionaryImportDialog({ open, language, onClose }: Props) {
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
      aria-labelledby="import-title"
      className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-lg border border-(--line) bg-(--surface) p-6 text-(--text) backdrop:bg-black/60"
    >
      {/* Mounted only while open, so every import starts from an empty paste box. */}
      {open && <ImportEditor language={language} onClose={onClose} />}
    </dialog>
  )
}
