import type { DictTranslation } from '../../features/dictionary/types'
import { fieldClass, secondaryButton } from './styles'

interface Props {
  index: number
  count: number
  /** Language of the translations, used in the label of the translated example. */
  language: string
  translation: DictTranslation
  onChange: (patch: Partial<DictTranslation>) => void
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
}

/** One translation of a word with its priority controls and its two examples. */
export function TranslationItem({ index, count, language, translation, onChange, onMove, onRemove }: Props) {
  return (
    <li className="space-y-2 rounded-lg border border-(--line) bg-(--raised) p-3">
      <div className="flex items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-(--bg) text-xs font-medium tabular-nums text-(--accent)">
          {index + 1}
        </span>
        <input
          value={translation.text}
          onChange={(e) => onChange({ text: e.target.value })}
          aria-label={`Translation ${index + 1}`}
          className={fieldClass}
        />
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move translation up" className={secondaryButton}>
          ↑
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label="Move translation down" className={secondaryButton}>
          ↓
        </button>
        <button type="button" onClick={onRemove} aria-label="Remove translation" className={secondaryButton}>
          ✕
        </button>
      </div>
      <label className="block text-sm text-(--muted)">
        Example in the original language
        <textarea
          value={translation.exampleOriginal}
          onChange={(e) => onChange({ exampleOriginal: e.target.value })}
          rows={2}
          className={`${fieldClass} mt-1 field-sizing-content text-(--text)`}
        />
      </label>
      <label className="block text-sm text-(--muted)">
        Example in {language}
        <textarea
          value={translation.exampleTranslated}
          onChange={(e) => onChange({ exampleTranslated: e.target.value })}
          rows={2}
          className={`${fieldClass} mt-1 field-sizing-content text-(--text)`}
        />
      </label>
    </li>
  )
}
