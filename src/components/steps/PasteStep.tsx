import { useMemo, useState } from 'react'
import { useStore } from '../../store/useStore'
import { splitPromptWithText } from '../../features/translation/prompts'
import { formatParagraphs } from '../../features/translation/sentences'
import { parseSheetPaste } from '../../features/translation/sheetPaste'
import { useCopy } from '../../lib/useCopy'

const field = 'w-full rounded-md border border-(--line) bg-(--bg) px-3 py-2 leading-relaxed outline-none focus:border-(--accent)'
const primary = 'rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink) disabled:opacity-40'
const secondary = 'rounded-md border border-(--line) px-4 py-2 text-sm hover:border-(--muted) disabled:opacity-40'

export function PasteStep() {
  const { draft, confirmText, confirmSheet } = useStore()
  const [text, setText] = useState(draft.text)
  const [sheet, setSheet] = useState('')
  const { copy, label } = useCopy<'prompt'>()

  const pasted = useMemo(() => parseSheetPaste(sheet), [sheet])
  const sentenceCount = pasted.paragraphs.reduce((total, paragraph) => total + paragraph.length, 0)
  const translationCount = Object.values(pasted.translations).filter((t) => t.text).length
  const commentCount = Object.values(pasted.translations).filter((t) => t.comment).length
  const completedCount = Object.values(pasted.translations).filter((t) => t.completed).length
  const sheetValid = sentenceCount > 0 && pasted.columns <= 4

  const useSheet = () =>
    confirmSheet(pasted.paragraphs.map((paragraph) => paragraph.join('\n')).join('\n\n'), formatParagraphs(pasted.paragraphs), pasted.translations)

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <label htmlFor="text" className="block font-medium">
          Paste normal text
        </label>
        <textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows={4} className={field} />
        <button type="button" onClick={() => confirmText(text)} disabled={!text.trim()} className={primary}>
          Use this text
        </button>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">Paste from Google Sheet</h3>
        <p className="max-w-prose text-sm leading-relaxed text-(--muted)">
          You can also let an AI split the text into sentences. Copy the prompt with the text above, give it to an AI, paste the list it returns into a
          Google Sheet, then copy it from the sheet and paste it below.
        </p>
        <button
          type="button"
          onClick={() => copy('prompt', splitPromptWithText(text))}
          disabled={!text.trim()}
          className={secondary}
        >
          {label('prompt', 'Use AI: copy prompt with text')}
        </button>

        <p className="max-w-prose text-sm leading-relaxed text-(--muted)">
          Paste one column with the original language, two columns with the original language and the translation, or up to four columns with a comment and "completed" as well. An empty row ends a paragraph.
        </p>
        <textarea
          id="sheet-text"
          value={sheet}
          onChange={(e) => setSheet(e.target.value)}
          rows={4}
          aria-label="Data from a Google Sheet"
          placeholder="Paste the column or columns from your Google Sheet here"
          className={`${field} placeholder:text-(--muted) placeholder:opacity-60`}
        />
        {sheet.trim() && (
          <p className="text-sm text-(--muted)">
            {pasted.columns > 4
              ? 'More than four columns were pasted. Paste the original, and optionally the translation, the comment and completed.'
              : sentenceCount === 0
                ? 'No sentences found in the pasted data.'
                : `${sentenceCount} ${sentenceCount === 1 ? 'sentence' : 'sentences'} in ${pasted.paragraphs.length} ${
                    pasted.paragraphs.length === 1 ? 'paragraph' : 'paragraphs'
                  }${translationCount > 0 ? `, ${translationCount} with a translation` : ''}${commentCount > 0 ? `, ${commentCount} with a comment` : ''}${completedCount > 0 ? `, ${completedCount} completed` : ''}.`}
          </p>
        )}
        <button type="button" onClick={useSheet} disabled={!sheetValid} className={primary}>
          Use this sheet data
        </button>
      </section>
    </div>
  )
}
