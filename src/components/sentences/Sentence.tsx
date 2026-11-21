import { useState } from 'react'
import { splitWords } from '../../features/translation/words'
import type { Tone } from '../../features/dictionary/tones'

/** What the expanded form needs on top of the sentence itself. */
export interface ExpandedProps {
  translation: string
  completed: boolean
  promptCopied: boolean
  onTranslationChange: (text: string) => void
  onCompletedChange: (completed: boolean) => void
  comment: string
  onCommentChange: (comment: string) => void
  onCopyPrompt: () => void
  onWordClick: (word: string) => void
  /** The color of a word of the original sentence, or null when it has none (it is not in the dictionary or has no language). */
  originalTone: (word: string) => Tone | null
  /** The color of a word inside the translation; only words that are kept untranslated have one. */
  translationTone: (word: string) => Tone | null
}

interface Props {
  number: number
  text: string
  /** When given, the sentence is shown expanded: original and translation badges plus actions. */
  expanded?: ExpandedProps
}

const numberBadge = 'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-(--bg) text-xs font-medium tabular-nums text-(--accent)'
const button = 'rounded-md border border-(--line) px-3 py-1.5 text-sm hover:border-(--muted)'
// The translation field is a transparent textarea on top of a copy of its text, so single words can be colored while typing.
// Both layers share these classes so the text lines up exactly.
const fieldLayer = 'col-start-1 row-start-1 h-full w-full whitespace-pre-wrap break-words rounded-md border px-3 py-2 leading-relaxed'
const toneColor = (tone: Tone) => ({ color: `var(--tone-${tone})` })

/** A single sentence shown as a badge, the unit the sentence-by-sentence translation works with. */
export function Sentence({ number, text, expanded }: Props) {
  // The comment field is shown when the sentence has a comment or the comment button was pressed.
  const [commentOpen, setCommentOpen] = useState(!!expanded?.comment)

  if (!expanded) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-(--line) bg-(--raised) px-3 py-2">
        <span className={numberBadge}>{number}</span>
        <span className="min-w-0 break-words leading-relaxed">{text}</span>
      </div>
    )
  }

  const { translation, completed, comment } = expanded
  const hasComment = comment.trim() !== ''
  const showComment = commentOpen || hasComment
  // A comment makes the frame red, whether or not the sentence is completed.
  const frame = hasComment ? 'border-(--tone-red)' : completed ? 'border-(--accent)' : 'border-(--line)'
  return (
    <div className={`space-y-3 rounded-lg border bg-(--raised) p-3 ${frame}`}>
      <div className="flex items-start gap-3">
        <span className={numberBadge}>{completed ? '✓' : number}</span>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="break-words rounded-md bg-(--bg) px-3 py-2 leading-relaxed">
            {splitWords(text).map((piece, i) => {
              if (!piece.word) return piece.text
              const tone = expanded.originalTone(piece.text)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => expanded.onWordClick(piece.text)}
                  style={tone ? toneColor(tone) : undefined}
                  className={`rounded-sm hover:bg-(--line) focus-visible:outline-2 focus-visible:outline-(--accent) ${
                    tone ? '' : 'underline decoration-1 decoration-dashed decoration-(--muted)/50 underline-offset-4'
                  }`}
                >
                  {piece.text}
                </button>
              )
            })}
          </p>
          <div className="grid">
            <div aria-hidden className={`${fieldLayer} pointer-events-none border-transparent bg-(--bg) text-(--blue)`}>
              {splitWords(translation).map((piece, i) => {
                const tone = piece.word ? expanded.translationTone(piece.text) : null
                return tone ? (
                  <span key={i} style={toneColor(tone)}>
                    {piece.text}
                  </span>
                ) : (
                  piece.text
                )
              })}
              {/* Keeps a trailing line break from collapsing, so both layers have the same height. */}
              {'\u200b'}
            </div>
            <textarea
              id={`translation-${number}`}
              rows={1}
              value={translation}
              readOnly={completed}
              onChange={(e) => expanded.onTranslationChange(e.target.value)}
              aria-label={`Translation of sentence ${number}`}
              placeholder="Paste or type the translation"
              className={`${fieldLayer} resize-none overflow-hidden border-(--line) bg-transparent text-transparent caret-(--blue) outline-none selection:bg-(--accent)/30 placeholder:text-(--muted) placeholder:opacity-60 focus:border-(--accent)`}
            />
          </div>
        </div>
      </div>
      {showComment && (
        <label className="block text-sm text-(--muted)">
          Comment
          <textarea
            id={`comment-${number}`}
            value={comment}
            onChange={(e) => expanded.onCommentChange(e.target.value)}
            rows={2}
            placeholder="Write a comment"
            className="mt-1 block w-full field-sizing-content resize-none rounded-md border border-(--line) bg-(--bg) px-3 py-2 leading-relaxed text-(--text) outline-none placeholder:text-(--muted) placeholder:opacity-60 focus:border-(--tone-red)"
          />
        </label>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={expanded.onCopyPrompt} className={button}>
          {expanded.promptCopied ? 'Copied' : 'Copy prompt'}
        </button>
        {showComment ? (
          <button
            type="button"
            onClick={() => {
              expanded.onCommentChange('')
              setCommentOpen(false)
            }}
            className={button}
          >
            Remove comment
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCommentOpen(true)
              requestAnimationFrame(() => document.getElementById(`comment-${number}`)?.focus())
            }}
            className={button}
          >
            Add comment
          </button>
        )}
        {completed ? (
          <button type="button" onClick={() => expanded.onCompletedChange(false)} className={button}>
            Undo complete
          </button>
        ) : (
          <button
            type="button"
            disabled={!translation.trim()}
            onClick={() => expanded.onCompletedChange(true)}
            className="rounded-md bg-(--accent) px-3 py-1.5 text-sm font-medium text-(--accent-ink) disabled:opacity-40"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  )
}
