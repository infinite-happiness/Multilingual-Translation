import { useMemo, useState } from 'react'
import { useStore } from '../../store/useStore'
import { buildEntries, columnCount, initialMapping, looksLikeHeader, parseTsv, planImport, type Target } from '../../features/dictionary/import'
import { ColumnMapping } from './ColumnMapping'
import { fieldClass, primaryButton, secondaryButton } from './styles'

interface Props {
  language: string
  onClose: () => void
}

const MAX_LISTED = 30

/** Lists words, but not more than MAX_LISTED so a long list cannot fill the dialog. */
const wordList = (words: string[]) => (words.length > MAX_LISTED ? `${words.slice(0, MAX_LISTED).join(', ')} and ${words.length - MAX_LISTED} more` : words.join(', '))

/** Paste data from a Google Sheet, map its columns to the dictionary's columns and import the words that are not in it yet. */
export function ImportEditor({ language, onClose }: Props) {
  const dictionary = useStore((s) => s.dictionaries[language])
  const importWords = useStore((s) => s.importWords)
  const fields = dictionary?.fields ?? []

  const [text, setText] = useState('')
  const [hasHeader, setHasHeader] = useState(false)
  const [mapping, setMapping] = useState<Target[]>([])
  const [result, setResult] = useState<{ imported: number; skipped: string[]; newFields: string[] } | null>(null)

  const rows = useMemo(() => parseTsv(text), [text])
  const columns = columnCount(rows)
  const header = hasHeader ? (rows[0] ?? null) : null
  const dataRows = hasHeader ? rows.slice(1) : rows
  const wordColumns = mapping.filter((m) => m === 'word').length

  // The pasted rows become entries once exactly one column is mapped to Word; existing words are skipped.
  const built = useMemo(
    () => (wordColumns === 1 ? buildEntries(dataRows, mapping, header, fields) : null),
    [wordColumns, dataRows, mapping, header, fields],
  )
  const plan = built ? planImport(built.entries, dictionary?.words ?? {}) : null

  const paste = (value: string) => {
    const parsed = parseTsv(value)
    const detected = looksLikeHeader(parsed)
    setText(value)
    setHasHeader(detected)
    setMapping(initialMapping(detected ? parsed[0] : null, columnCount(parsed), fields, language))
  }
  const toggleHeader = (checked: boolean) => {
    setHasHeader(checked)
    setMapping(initialMapping(checked ? (rows[0] ?? null) : null, columns, fields, language))
  }
  const run = () => {
    if (!plan || !built) return
    importWords(language, plan.fresh, built.newFields)
    setResult({ imported: plan.fresh.length, skipped: plan.skipped, newFields: built.newFields })
  }

  if (result) {
    return (
      <div className="space-y-4">
        <h2 id="import-title" className="text-xl font-medium">Import finished</h2>
        <p>
          Imported {result.imported} {result.imported === 1 ? 'word' : 'words'}.
          {result.newFields.length > 0 && ` Added the custom ${result.newFields.length === 1 ? 'field' : 'fields'} ${result.newFields.join(', ')}.`}
        </p>
        {result.skipped.length > 0 && (
          <p className="rounded-md border border-(--accent) p-3 text-sm">
            Skipped {result.skipped.length} {result.skipped.length === 1 ? 'word' : 'words'} that already exist in the dictionary or appear more than
            once in the pasted data: {wordList(result.skipped)}.
          </p>
        )}
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className={primaryButton}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 id="import-title" className="text-xl font-medium">Import into the {language} dictionary</h2>
        <p className="mt-1 text-sm text-(--muted)">
          Paste data copied from a Google Sheet, then choose which dictionary column each pasted column belongs to. Words that are already in the
          dictionary are skipped.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => paste(e.target.value)}
        rows={5}
        aria-label="Data from a Google Sheet"
        placeholder="Paste the data from your Google Sheet here"
        className={fieldClass}
      />

      {rows.length > 0 && (
        <>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hasHeader} onChange={(e) => toggleHeader(e.target.checked)} className="size-4 accent-(--accent)" />
            The first row contains column names
          </label>
          <ColumnMapping
            preview={dataRows.slice(0, 5)}
            totalRows={dataRows.length}
            header={header}
            columns={columns}
            mapping={mapping}
            fields={fields}
            language={language}
            onChange={(column, target) => setMapping((m) => m.map((x, i) => (i === column ? target : x)))}
          />

          {wordColumns !== 1 ? (
            <p className="text-sm text-(--muted)">Choose exactly one column for Word.</p>
          ) : (
            plan && (
              <div className="space-y-2 text-sm">
                <p>
                  {plan.fresh.length} new {plan.fresh.length === 1 ? 'word' : 'words'} will be imported.
                </p>
                {plan.skipped.length > 0 && (
                  <p className="rounded-md border border-(--accent) p-3">
                    {plan.skipped.length} {plan.skipped.length === 1 ? 'word' : 'words'} already exist or appear more than once and will be skipped:{' '}
                    {wordList(plan.skipped)}.
                  </p>
                )}
              </div>
            )
          )}
        </>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={secondaryButton}>
          Cancel
        </button>
        <button type="button" onClick={run} disabled={!plan || plan.fresh.length === 0} className={primaryButton}>
          Import
        </button>
      </div>
    </div>
  )
}
