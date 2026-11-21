import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { PUBLISHING_FIELDS, type Publishing } from '../../features/translation/publishing'

const field = 'w-full max-w-md rounded-md border border-(--line) bg-(--bg) px-3 py-2 outline-none focus:border-(--accent)'

export function TitleStep() {
  const { draft, confirmTitle } = useStore()
  const [value, setValue] = useState(draft.title)
  const [publishing, setPublishing] = useState<Publishing>(draft.publishing)
  const [useFolder, setUseFolder] = useState(draft.useFolderPublishing)
  const submit = () => value.trim() && confirmTitle(value.trim(), publishing, useFolder)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm text-(--muted)" htmlFor="title">
          Name this translation so you can find it in the translations list
        </label>
        <input
          id="title"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className={field}
        />
      </div>

      <section className="space-y-3">
        <h3 className="font-medium">
          Publishing data <span className="font-normal text-(--muted)">(optional)</span>
        </h3>
        {PUBLISHING_FIELDS.map(({ key, label }) => (
          <label key={key} className="block text-sm text-(--muted)">
            {label} &nbsp;
            <input
              id={`publishing-${key}`}
              value={publishing[key]}
              onChange={(e) => setPublishing({ ...publishing, [key]: e.target.value })}
              className={`${field} mt-1 text-(--text)`}
            />
          </label>
        ))}
        {draft.folder && (
          <label className="flex max-w-prose items-start gap-2 text-sm">
            <input type="checkbox" checked={useFolder} onChange={(e) => setUseFolder(e.target.checked)} className="mt-0.5 size-4 accent-(--accent)" />
            <span>
              Use the same publishing data for all translations in this folder
              <span className="block text-(--muted)">{draft.folder}: changing it here changes it for every translation in the folder that uses it.</span>
            </span>
          </label>
        )}
      </section>

      <button type="button" onClick={submit} disabled={!value.trim()} className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink) disabled:opacity-40">
        Done
      </button>
    </div>
  )
}
