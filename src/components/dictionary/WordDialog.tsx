import { useEffect, useRef } from 'react'
import { WordEditor } from './WordEditor'

interface Props {
  /** The word to edit, or null when no word is open. */
  word: string | null
  /** Opens the dialog for a new word, which is typed in the dialog itself. */
  creating?: boolean
  language: string
  onClose: () => void
}

/** Dialog for the dictionary entry of a word, or for adding a new word. Escape or Cancel closes it without saving. */
export function WordDialog({ word, creating = false, language, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const open = creating || word !== null

  // Keeps the native dialog in step with whether a word is open.
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
      aria-labelledby="word-title"
      className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg border border-(--line) bg-(--surface) p-6 text-(--text) backdrop:bg-black/60"
    >
      {/* Mounted only while open, so the editor starts from the stored entry (or an empty one) each time. */}
      {open && <WordEditor key={creating ? 'new' : word} word={word ?? ''} creating={creating} language={language} onClose={onClose} />}
    </dialog>
  )
}
