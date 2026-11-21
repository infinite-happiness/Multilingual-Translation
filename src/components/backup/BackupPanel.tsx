import { useEffect, useState } from 'react'
import { createBackup, offerInPreview } from '../../lib/backup'

/** Explanation and download link for the backup file, shared by the Tools dialog and the Backup step. */
export function BackupPanel() {
  const [backup, setBackup] = useState<{ filename: string; json: string; url: string } | null>(null)

  // Builds the backup when the panel appears and releases its download URL when the panel goes away.
  useEffect(() => {
    const { filename, json } = createBackup()
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    setBackup({ filename, json, url })
    return () => URL.revokeObjectURL(url)
  }, [])

  return (
    <div className="space-y-4">
      <p className="max-w-prose text-sm leading-relaxed text-(--muted)">
        Everything you create here is stored only in this browser. Clearing the browser data, using a private window, or switching browser or
        computer removes it. Download a backup file and keep it somewhere safe.
      </p>
      {backup && (
        <a
          href={backup.url}
          download={backup.filename}
          onClick={(e) => {
            if (!__PREVIEW__) return
            e.preventDefault()
            void offerInPreview(backup.filename, backup.json)
          }}
          className="inline-block rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink)"
        >
          Download {backup.filename}
        </a>
      )}
    </div>
  )
}
