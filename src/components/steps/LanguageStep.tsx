import { useState } from 'react'
import { useStore, type SourceLanguage } from '../../store/useStore'
import { knownSourceLanguages, sameLanguage, translationsUsing, usedLanguages } from '../../features/translation/languages'
import { ConfirmDialog } from '../ConfirmDialog'
import { focusOpenStep } from '../../lib/scroll'

const field = 'w-full max-w-md rounded-md border border-(--line) bg-(--bg) px-3 py-2 outline-none focus:border-(--accent)'

export function LanguageStep() {
  const { languages, history, draft, confirmLanguages, removeLanguage } = useStore()
  // Both sections are edited as copies and only stored when Done is pressed.
  const [target, setTarget] = useState(draft.language)
  const [sources, setSources] = useState<SourceLanguage[]>(draft.sourceLanguages)
  const [newSource, setNewSource] = useState('')
  const [useFolder, setUseFolder] = useState(draft.useFolderLanguages)
  // The language whose button could not be removed because translations use it.
  const [blocked, setBlocked] = useState<string | null>(null)

  const usedTargets = usedLanguages(languages, history)
  const known = knownSourceLanguages(history)
  const suggestions = known.filter((k) => !sources.some((s) => sameLanguage(s.name, k.name)))

  // A language used before comes back with the tick it had most recently; a new one starts ticked.
  const addSource = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed || sources.some((s) => sameLanguage(s.name, trimmed))) return
    const remembered = known.find((k) => sameLanguage(k.name, trimmed))
    setSources([...sources, { name: remembered?.name ?? trimmed, translate: remembered?.translate ?? true }])
    setNewSource('')
  }
  const toggle = (name: string) => setSources(sources.map((s) => (s.name === name ? { ...s, translate: !s.translate } : s)))
  const remove = (name: string) => setSources(sources.filter((s) => s.name !== name))

  const removeButton = (language: string) => {
    if (translationsUsing(history, language).length > 0) setBlocked(language)
    else removeLanguage(language)
  }
  const blockedBy = blocked ? translationsUsing(history, blocked) : []

  const done = () => {
    confirmLanguages(target.trim(), sources, useFolder)
    focusOpenStep()
  }

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${active ? 'border-(--accent) text-(--accent)' : 'border-(--line) text-(--muted) hover:text-(--text)'}`

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <label className="block text-sm text-(--muted)" htmlFor="lang">
          Target language: the language to translate into
        </label>
        <input id="lang" value={target} onChange={(e) => setTarget(e.target.value)} className={field} />
        {usedTargets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {usedTargets.map((l) => (
              <span
                key={l}
                className={`inline-flex items-center overflow-hidden rounded-full border text-sm ${target === l ? 'border-(--accent) text-(--accent)' : 'border-(--line) text-(--muted)'
                  }`}
              >
                <button type="button" onClick={() => setTarget(l)} className="py-1 pr-1 pl-3 hover:text-(--text)">
                  {l}
                </button>
                <button
                  type="button"
                  onClick={() => removeButton(l)}
                  aria-label={`Remove the language button ${l}`}
                  className="px-2 py-1 hover:bg-(--raised) hover:text-(--text)"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <label className="block text-sm text-(--muted)" htmlFor="source-lang">
          Source languages: the languages used in the text. Tick the ones to translate, and untick the others. If you're translating from English and Sanskrit, add English and Sanskrit. If you want to translate English words and keep the Sanskrit words in Sanskrit, make sure English is ticked and Sanskrit unticked.
        </label>
        <div className="flex max-w-md gap-2">
          <input
            id="source-lang"
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSource(newSource)}
            aria-describedby="source-hint"
            className={`${field} min-w-0 flex-1`}
          />
          <button
            type="button"
            onClick={() => addSource(newSource)}
            disabled={!newSource.trim() || sources.some((s) => sameLanguage(s.name, newSource.trim()))}
            className="shrink-0 rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink) disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <p id="source-hint" className="text-sm text-(--muted)">
          Press Enter to add a language.
        </p>
        {sources.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {sources.map((s) => (
              <li key={s.name} className="flex overflow-hidden rounded-full border border-(--line)">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={s.translate}
                  onClick={() => toggle(s.name)}
                  className="flex items-center gap-2 py-1 pr-2 pl-3 text-sm hover:bg-(--raised)"
                >
                  <span
                    className={`grid size-4 place-items-center rounded-sm border text-[10px] ${s.translate ? 'border-(--accent) bg-(--accent) text-(--accent-ink)' : 'border-(--muted)'
                      }`}
                    aria-hidden
                  >
                    {s.translate ? '✓' : ''}
                  </span>
                  {s.name}
                  <span className="text-(--muted)">{s.translate ? 'translate' : "don't translate"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => remove(s.name)}
                  aria-label={`Remove ${s.name}`}
                  className="px-2 text-sm text-(--muted) hover:bg-(--raised) hover:text-(--text)"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-(--muted)">Used before:</span>
            {suggestions.map((k) => (
              <button key={k.name} type="button" onClick={() => addSource(k.name)} className={chip(false)}>
                + {k.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {draft.folder && (
        <label className="flex max-w-prose items-start gap-2 text-sm">
          <input type="checkbox" checked={useFolder} onChange={(e) => setUseFolder(e.target.checked)} className="mt-0.5 size-4 accent-(--accent)" />
          <span>
            Use the same languages for all translations in this folder
            <span className="block text-(--muted)">
              {draft.folder}: this step is skipped for the translations in the folder, but it stays available.
            </span>
          </span>
        </label>
      )}

      <ConfirmDialog open={!!blocked} title={`“${blocked}” is still used`} onClose={() => setBlocked(null)}>
        <p>
          It is the language of {blockedBy.length} {blockedBy.length === 1 ? 'translation' : 'translations'}:{' '}
          {blockedBy.map((h) => h.title || h.language).join(', ')}.
        </p>
        <p>Delete those translations, or change their language, and then the button can be removed.</p>
      </ConfirmDialog>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!target.trim()}
          onClick={done}
          className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink) disabled:opacity-40"
        >
          Done
        </button>
        {!target.trim() && <span className="text-sm text-(--muted)">Enter a target language to continue</span>}
      </div>
    </div>
  )
}
