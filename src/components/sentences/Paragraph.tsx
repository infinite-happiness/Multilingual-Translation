import type { ReactNode } from 'react'

interface Props {
  /** Position of the paragraph, starting at 1. */
  index: number
  total: number
  /** Number of the paragraph's first sentence, starting at 1. */
  firstSentence: number
  sentenceCount: number
  /** Number of sentences in the whole text. */
  totalSentences: number
  /** The sentences of the paragraph, as list items. */
  children: ReactNode
}

/** A paragraph of sentences with a header that says which paragraph it is and how many sentences it holds. */
export function Paragraph({ index, total, firstSentence, sentenceCount, totalSentences, children }: Props) {
  return (
    // The bottom margin is the empty row after every paragraph, as in the list that is copied to the sheet.
    <section aria-label={`Paragraph ${index} of ${total}`} className="mb-6">
      <h3 className="mb-2 flex items-center gap-3 text-sm text-(--muted)">
        <span className="font-medium text-(--text)">
          Paragraph {index} of {total}
        </span>
        <span>
          {sentenceCount === 1 ? `Sentence ${firstSentence}` : `Sentences ${firstSentence} - ${firstSentence + sentenceCount - 1}`} out of {totalSentences}
        </span>
        <span className="h-px flex-1 bg-(--line)" aria-hidden />
      </h3>
      <ol className="space-y-3">{children}</ol>
    </section>
  )
}
