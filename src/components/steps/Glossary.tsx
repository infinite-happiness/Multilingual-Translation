import { glossaryFor, glossarySheet, glossaryText, type GlossaryEntry } from '../../features/translation/glossary'
import type { Dictionary } from '../../features/dictionary/types'
import type { SourceLanguage } from '../../store/useStore'
import { useCopy } from '../../lib/useCopy'

interface Props {
  language: string
  entries: GlossaryEntry[]
}

/** The glossary of one source language, with buttons for copying it as text or for a Google Sheet. */
export function Glossary({ language, entries }: Props) {
  const { copy, label } = useCopy<'text' | 'sheet'>()
  const button = 'rounded-md border border-(--line) px-4 py-2 text-sm hover:border-(--muted) disabled:opacity-40'

  return (
    <section className="space-y-3">
      <h5 className="text-sm font-semibold tracking-wide text-(--accent) uppercase">{language}</h5>
      {entries.length === 0 ? (
        <p className="text-sm text-(--muted)">No words from this language are in the dictionary yet.</p>
      ) : (
        <ul className="max-w-prose space-y-1 leading-relaxed">
          {entries.map((entry) => (
            <li key={entry.word} className="break-words">
              <span className="font-medium">{entry.word}</span>
              {entry.translations.length > 0 && <span className="text-(--muted)">: {entry.translations.join(', ')}</span>}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={entries.length === 0} onClick={() => copy('text', glossaryText(entries))} className={button}>
          {label('text', 'Copy text')}
        </button>
        <button type="button" disabled={entries.length === 0} onClick={() => copy('sheet', glossarySheet(entries))} className={button}>
          {label('sheet', 'Copy to Google Sheet')}
        </button>
      </div>
    </section>
  )
}

interface SetProps {
  title: string
  /** One glossary is shown for each of these source languages. */
  sources: SourceLanguage[]
  /** The sentences of the original texts the glossary words are taken from. */
  paragraphs: string[][]
  dictionary: Dictionary | undefined
}

/** The glossaries of all source languages for a set of texts. */
export function GlossarySet({ title, sources, paragraphs, dictionary }: SetProps) {
  return (
    // A card per set of texts: a shaded header band, then one block per language with a line between the blocks.
    <section className="rounded-lg border border-(--line) p-4">
      <h4 className="-mx-4 -mt-4 mb-4 rounded-t-lg border-b border-(--line) bg-(--raised) px-4 py-2 font-medium">{title}</h4>
      <div className="divide-y divide-(--line)">
        {sources.map((source) => (
          <div key={source.name} className="py-4 first:pt-0 last:pb-0">
            <Glossary language={source.name} entries={glossaryFor(source.name, paragraphs, dictionary)} />
          </div>
        ))}
      </div>
    </section>
  )
}
