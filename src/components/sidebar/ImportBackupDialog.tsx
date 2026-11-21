import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { parseBackup, restoreBackup, type ParsedBackup } from '../../lib/backup'

interface Props {
  open: boolean
  onClose: () => void
}

/** Dialog for restoring everything from a backup file. Escape or Cancel closes it without importing. */
export function ImportBackupDialog({ open, onClose }: Props) {
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
      aria-labelledby="import-backup-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-(--line) bg-(--surface) p-6 text-(--text) backdrop:bg-black/60"
    >
      {/* Mounted only while open, so every import starts without a chosen file. */}
      {open && <ImportBackupEditor onClose={onClose} />}
    </dialog>
  )
}

function ImportBackupEditor({ onClose }: { onClose: () => void }) {
  const stored = useStore((s) => s.history.length)
  const [backup, setBackup] = useState<ParsedBackup | null>(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const choose = async (file: File | undefined) => {
    setBackup(null)
    setError('')
    if (!file) return
    try {
      setBackup(parseBackup(await file.text()))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The file could not be read.')
    }
  }
  const run = async () => {
    if (!backup) return
    await restoreBackup(backup)
    setDone(true)
  }

  if (done) {
    return (
      <div className="space-y-4">
        <h2 id="import-backup-title" className="text-lg font-medium">Import finished</h2>
        <p className="text-sm text-(--muted)">Everything from the backup file has been restored.</p>
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink)">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 id="import-backup-title" className="text-lg font-medium">Import a backup</h2>
      <p className="text-sm leading-relaxed text-(--muted)">
        Choose a backup file that was downloaded under Tools. Importing replaces everything that is stored in this browser now, so make a backup
        of the current data first if you still need it.
      </p>
      <input
        type="file"
        accept=".json,application/json"
        onChange={(e) => choose(e.target.files?.[0])}
        aria-label="Backup file"
        className="block w-full text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-(--line) file:bg-transparent file:px-3 file:py-2 file:text-sm file:text-(--text)"
      />
      {error && <p className="text-sm text-(--tone-red)">{error}</p>}
      {backup && (
        <p className="text-sm">
          The file contains {backup.translations} {backup.translations === 1 ? 'translation' : 'translations'} and {backup.words}{' '}
          {backup.words === 1 ? 'dictionary word' : 'dictionary words'}. Currently stored here: {stored} {stored === 1 ? 'translation' : 'translations'}.
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-md border border-(--line) px-4 py-2 text-sm text-(--muted) hover:text-(--text)">
          Cancel
        </button>
        <button
          type="button"
          onClick={run}
          disabled={!backup}
          className="rounded-md bg-(--tone-red) px-4 py-2 text-sm font-medium text-(--bg) disabled:opacity-40"
        >
          Replace everything
        </button>
      </div>
    </div>
  )
}
