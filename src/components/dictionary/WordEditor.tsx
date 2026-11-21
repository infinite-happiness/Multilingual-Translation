import { useState } from 'react'
import { useStore, type SourceLanguage } from '../../store/useStore'
import { displayWord, startsCapitalized, wordKey, type DictTranslation, type DictWord } from '../../features/dictionary/types'
import { TranslationItem } from './TranslationItem'
import { WordOptions } from './WordOptions'
import { fieldClass, primaryButton, secondaryButton } from './styles'

interface Props {
  word: string
  /** True when a new word is being added; the word is then typed in the editor. */
  creating?: boolean
  language: string
  onClose: () => void
}

/** A new word starts in the first source language that is ticked to translate, or else the first source language. */
const defaultLanguage = (sources: SourceLanguage[]) => (sources.find((s) => s.translate) ?? sources[0])?.name ?? ''

/** The default language only comes from the open translation when that translation's target language is the dictionary's. */
const defaultLanguageFor = (dictionaryLanguage: string) => {
  const draft = useStore.getState().draft
  return draft.language === dictionaryLanguage ? defaultLanguage(draft.sourceLanguages) : ''
}

/** Edits the dictionary entry of one word; nothing reaches the dictionary until Save is pressed. */
export function WordEditor({ word, creating = false, language, onClose }: Props) {
  const saveWord = useStore((s) => s.saveWord)
  const dictionary = useStore((s) => s.dictionaries[language])
  // The editor works on copies of the stored data.
  const [fields, setFields] = useState(() => useStore.getState().dictionaries[language]?.fields ?? [])
  const [entry, setEntry] = useState<DictWord>(
    () =>
      useStore.getState().dictionaries[language]?.words[wordKey(word)] ?? {
        word,
        capitalized: startsCapitalized(word),
        language: defaultLanguageFor(language),
        translations: [],
        custom: {},
      },
  )
  const [newTranslation, setNewTranslation] = useState('')
  // For a new word the Capitalized box follows the typed word until the box is changed by hand.
  const [capitalizedTouched, setCapitalizedTouched] = useState(false)
  const [newField, setNewField] = useState('')

  const setTranslations = (translations: DictTranslation[]) => setEntry((e) => ({ ...e, translations }))

  const addTranslation = () => {
    const text = newTranslation.trim()
    if (!text) return
    setTranslations([...entry.translations, { id: crypto.randomUUID(), text, exampleOriginal: '', exampleTranslated: '' }])
    setNewTranslation('')
  }
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= entry.translations.length) return
    const list = [...entry.translations]
    ;[list[index], list[target]] = [list[target], list[index]]
    setTranslations(list)
  }

  const fieldName = newField.trim()
  const fieldTaken = fields.some((f) => f.toLowerCase() === fieldName.toLowerCase())
  const addField = () => {
    if (!fieldName || fieldTaken) return
    setFields([...fields, fieldName])
    setNewField('')
  }

  const typedWord = entry.word.trim()
  const exists = creating && !!dictionary?.words[wordKey(typedWord)]
  const changeWord = (value: string) =>
    setEntry((e) => ({ ...e, word: value, capitalized: capitalizedTouched ? e.capitalized : startsCapitalized(value) }))
  const changeOptions = (patch: Partial<DictWord>) => {
    if ('capitalized' in patch) setCapitalizedTouched(true)
    setEntry((e) => ({ ...e, ...patch }))
  }

  const save = () => {
    saveWord(language, fields, { ...entry, word: typedWord })
    onClose()
  }

  return (
    <>
      <p className="text-sm text-(--muted)">Dictionary · {language}</p>
      <h2 id="word-title" className="mt-1 break-words text-xl font-medium">
        {creating ? 'New word' : displayWord(entry)}
      </h2>
      {creating && (
        <label className="mt-4 block text-sm text-(--muted)">
          Word
          <input id="new-word" autoFocus value={entry.word} onChange={(e) => changeWord(e.target.value)} className={`${fieldClass} mt-1 text-(--text)`} />
          {exists && <span className="mt-1 block">“{typedWord}” is already in the dictionary. Open it from the list to edit it.</span>}
        </label>
      )}
      <WordOptions entry={entry} language={language} onChange={changeOptions} />

      <section className="mt-5 space-y-3">
        <h3 className="font-medium">Translations</h3>
        <p className="text-sm text-(--muted)">The first translation has the highest priority.</p>
        {entry.translations.length === 0 ? (
          <p className="text-sm text-(--muted)">No translations yet.</p>
        ) : (
          <ol className="space-y-3">
            {entry.translations.map((t, i) => (
              <TranslationItem
                key={t.id}
                index={i}
                count={entry.translations.length}
                language={language}
                translation={t}
                onChange={(patch) => setTranslations(entry.translations.map((x) => (x.id === t.id ? { ...x, ...patch } : x)))}
                onMove={(direction) => move(i, direction)}
                onRemove={() => setTranslations(entry.translations.filter((x) => x.id !== t.id))}
              />
            ))}
          </ol>
        )}
        <div className="flex gap-2">
          <input
            value={newTranslation}
            onChange={(e) => setNewTranslation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTranslation()}
            aria-label="New translation"
            placeholder="New translation"
            className={fieldClass}
          />
          <button type="button" onClick={addTranslation} disabled={!newTranslation.trim()} className={`${secondaryButton} shrink-0`}>
            Add translation
          </button>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h3 className="font-medium">Custom fields</h3>
        <p className="text-sm text-(--muted)">A field you add here is added to every word in this dictionary.</p>
        {fields.map((name) => (
          <label key={name} className="block text-sm text-(--muted)">
            {name}
            <input
              value={entry.custom[name] ?? ''}
              onChange={(e) => setEntry((prev) => ({ ...prev, custom: { ...prev.custom, [name]: e.target.value } }))}
              className={`${fieldClass} mt-1 text-(--text)`}
            />
          </label>
        ))}
        <div className="flex gap-2">
          <input
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addField()}
            aria-label="Name of the new field"
            placeholder="Name of the new field"
            className={fieldClass}
          />
          <button type="button" onClick={addField} disabled={!fieldName || fieldTaken} className={`${secondaryButton} shrink-0`}>
            Add field
          </button>
        </div>
      </section>

      <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex justify-end gap-2 border-t border-(--line) bg-(--surface) px-6 py-4">
        <button type="button" onClick={onClose} className={secondaryButton}>
          Cancel
        </button>
        <button type="button" onClick={save} disabled={creating && (!typedWord || exists)} className={primaryButton}>
          Save
        </button>
      </div>
    </>
  )
}
