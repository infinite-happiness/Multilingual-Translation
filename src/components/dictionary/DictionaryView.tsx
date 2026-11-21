import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { entryMatches } from '../../features/dictionary/search'
import { displayWord, type DictWord } from '../../features/dictionary/types'
import { WordCard } from './WordCard'
import { WordDialog } from './WordDialog'
import { DictionaryImportDialog } from './DictionaryImportDialog'
import { ConfirmDialog } from '../ConfirmDialog'
import { DictionaryCopyButton } from '../sheets/DictionaryCopyButton'
import { fieldClass, secondaryButton } from './styles'

interface Props {
  language: string
  onBack: () => void
}

/** All words of one language's dictionary, filterable with a search field. */
export function DictionaryView({ language, onBack }: Props) {
  const dictionary = useStore((s) => s.dictionaries[language])
  const [query, setQuery] = useState('')
  const [openWord, setOpenWord] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [wordToDelete, setWordToDelete] = useState<DictWord | null>(null)
  const deleteDictionary = useStore((s) => s.deleteDictionary)
  const deleteWord = useStore((s) => s.deleteWord)

  const words = Object.values(dictionary?.words ?? {}).sort((a, b) => displayWord(a).localeCompare(displayWord(b)))
  const shown = words.filter((entry) => entryMatches(entry, query))
  const count = query.trim() ? `${shown.length} of ${words.length}` : `${words.length}`

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stays in view so the search field is reachable while scrolling a long dictionary. */}
      <div className="sticky top-0 z-10 space-y-3 bg-(--bg) pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-medium">Dictionary · {language}</h1>
            <p className="text-sm text-(--muted)">
              {count} {words.length === 1 ? 'word' : 'words'}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdding(true)} className={secondaryButton}>
              Add word
            </button>
            <DictionaryCopyButton language={language} label="Copy to Google Sheet" className={secondaryButton} />
            <button type="button" onClick={() => setImportOpen(true)} className={secondaryButton}>
              Import
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={!dictionary}
              className={`${secondaryButton} text-(--tone-red)`}
            >
              Delete dictionary
            </button>
            <button type="button" onClick={onBack} className={secondaryButton}>
              Back to translation
            </button>
          </div>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search the dictionary"
          placeholder="Search words, translations, examples and fields"
          className={fieldClass}
        />
      </div>

      {words.length === 0 ? (
        <p className="mt-4 text-(--muted)">No words yet. Click a word in the sentence-by-sentence step to add it.</p>
      ) : shown.length === 0 ? (
        <p className="mt-4 text-(--muted)">No words match your search.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {shown.map((entry) => (
            <WordCard key={entry.word.toLowerCase()} entry={entry} fields={dictionary?.fields ?? []} language={language} onOpen={() => setOpenWord(entry.word)} onDelete={() => setWordToDelete(entry)} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete the ${language} dictionary?`}
        confirmLabel="Delete dictionary"
        onConfirm={() => {
          deleteDictionary(language)
          setDeleteOpen(false)
        }}
        onClose={() => setDeleteOpen(false)}
      >
        <p>
          This deletes all {words.length} {words.length === 1 ? 'word' : 'words'} with their translations, examples and custom fields. The language and
          your translations are not affected.
        </p>
        <p>To keep a copy, use the dictionary button in the Backup step first.</p>
      </ConfirmDialog>
      <DictionaryImportDialog open={importOpen} language={language} onClose={() => setImportOpen(false)} />
      <WordDialog
        word={openWord}
        creating={adding}
        language={language}
        onClose={() => {
          setOpenWord(null)
          setAdding(false)
        }}
      />
      <ConfirmDialog
        open={!!wordToDelete}
        title={`Delete “${wordToDelete ? displayWord(wordToDelete) : ''}”?`}
        confirmLabel="Delete word"
        onConfirm={() => {
          if (wordToDelete) deleteWord(language, wordToDelete.word)
          setWordToDelete(null)
        }}
        onClose={() => setWordToDelete(null)}
      >
        <p>
          This deletes the word with its {wordToDelete?.translations.length ?? 0}{' '}
          {wordToDelete?.translations.length === 1 ? 'translation' : 'translations'}, their examples and its custom field values.
        </p>
      </ConfirmDialog>
    </div>
  )
}
