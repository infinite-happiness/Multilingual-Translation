import { useStore } from '../../store/useStore'
import { parseSentences } from '../../features/translation/sentences'
import { sheetText, type SheetColumns } from '../../features/translation/sheet'
import { useCopy } from '../../lib/useCopy'

const BUTTONS: [SheetColumns, string][] = [
  ['original', 'Copy original to Google Sheet'],
  ['translation', 'Copy translation to Google Sheet'],
  ['all', 'Copy all to Google Sheet'],
]

/** The three buttons that copy the current translation to the clipboard for pasting into a Google Sheet. */
export function SheetCopyButtons() {
  const draft = useStore((s) => s.draft)
  const { copy, label } = useCopy<SheetColumns>()
  const paragraphs = parseSentences(draft.sentences)

  return (
    <div className="flex flex-wrap gap-2">
      {BUTTONS.map(([columns, text]) => (
        <button
          key={columns}
          type="button"
          disabled={paragraphs.length === 0}
          onClick={() => copy(columns, sheetText(paragraphs, draft.translations, columns))}
          className="rounded-md border border-(--line) px-4 py-2 text-sm hover:border-(--muted) disabled:opacity-40"
        >
          {label(columns, text)}
        </button>
      ))}
    </div>
  )
}
