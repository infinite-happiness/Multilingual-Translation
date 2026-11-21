import { useStore } from '../../store/useStore'
import { dictionarySheetText } from '../../features/dictionary/sheet'
import { useCopy } from '../../lib/useCopy'

interface Props {
  /** The language of the dictionary to copy. */
  language: string
  /** Overrides the default button text. */
  label?: string
  className?: string
}

/** Copies a dictionary to the clipboard for pasting into a Google Sheet. */
export function DictionaryCopyButton({
  language,
  label: idleLabel,
  className = 'rounded-md border border-(--line) px-4 py-2 text-sm hover:border-(--muted) disabled:opacity-40',
}: Props) {
  const dictionary = useStore((s) => s.dictionaries[language])
  const { copy, label } = useCopy<'dictionary'>()
  const hasWords = !!dictionary && Object.keys(dictionary.words).length > 0

  return (
    <button
      type="button"
      disabled={!hasWords}
      onClick={() => dictionary && copy('dictionary', dictionarySheetText(dictionary, language))}
      className={className}
    >
      {label('dictionary', idleLabel ?? (language ? `Copy ${language} dictionary to Google Sheet` : 'Copy dictionary to Google Sheet'))}
    </button>
  )
}
