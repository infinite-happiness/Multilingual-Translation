import { useState } from 'react'
import { useStore } from '../../store/useStore'

export function FolderStep() {
  const { folders, draft, confirmFolder } = useStore()
  const [value, setValue] = useState('')
  const create = () => value.trim() && confirmFolder(value.trim())
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${active ? 'border-(--accent) text-(--accent)' : 'border-(--line) text-(--muted) hover:text-(--text)'}`

  return (
    <div className="space-y-3">
      <label className="block text-sm text-(--muted)" htmlFor="folder">
        Create a new folder, pick an existing one, or skip
      </label>
      <div className="flex max-w-md gap-2">
        <input
          id="folder"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && create()}
          className="min-w-0 flex-1 rounded-md border border-(--line) bg-(--bg) px-3 py-2 outline-none focus:border-(--accent)"
        />
        <button type="button" onClick={create} disabled={!value.trim()} className="shrink-0 rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink) disabled:opacity-40">
          Use this folder
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {folders.map((f) => (
          <button key={f} type="button" onClick={() => confirmFolder(f)} className={chip(draft.folder === f)}>
            {f}
          </button>
        ))}
        {/* "No folder" only counts as chosen once this step has been completed. */}
        <button type="button" onClick={() => confirmFolder('')} className={chip(draft.done.includes('folder') && !draft.folder)}>
          No folder
        </button>
      </div>
    </div>
  )
}
