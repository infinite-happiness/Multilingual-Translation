import { useStore } from '../../store/useStore'
import { knownSourceLanguages, sameLanguage } from '../../features/translation/languages'
import type { DictWord } from '../../features/dictionary/types'
import { fieldClass } from './styles'

interface Props {
  entry: DictWord
  /** The target language, which is also the language of the dictionary. */
  language: string
  onChange: (patch: Partial<DictWord>) => void
}

/** The "Capitalized" tick box and the language select of a dictionary entry. */
export function WordOptions({ entry, language, onChange }: Props) {
  const draftSources = useStore((s) => s.draft.sourceLanguages)
  const history = useStore((s) => s.history)

  // The source languages of this translation come first, then those of earlier translations.
  const sources = [...draftSources]
  for (const known of knownSourceLanguages(history)) {
    if (!sources.some((s) => sameLanguage(s.name, known.name))) sources.push(known)
  }
  const translated = sources.filter((s) => s.translate).map((s) => s.name)
  const notTranslated = sources.filter((s) => !s.translate).map((s) => s.name)
  const listed = [...translated, ...notTranslated, language]
  // A language that came from an import may not be one of the languages above; it stays selectable.
  const other = entry.language && !listed.some((name) => sameLanguage(name, entry.language)) ? [entry.language] : []

  return (
    <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={entry.capitalized}
          onChange={(e) => onChange({ capitalized: e.target.checked })}
          className="size-4 accent-(--accent)"
        />
        Capitalized
      </label>
      <label className="block text-sm text-(--muted)">
        Language of the word
        <select
          value={entry.language}
          onChange={(e) => onChange({ language: e.target.value })}
          className={`${fieldClass} mt-1 min-w-56 py-1.5 text-(--text)`}
        >
          <option value="">Not set</option>
          {translated.length > 0 && (
            <optgroup label="Translated from">
              {translated.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </optgroup>
          )}
          {notTranslated.length > 0 && (
            <optgroup label="Not translated">
              {notTranslated.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label="Target language">
            <option value={language}>{language}</option>
          </optgroup>
          {other.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
