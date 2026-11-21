import { useStore } from '../../store/useStore'
import { nextSentenceToTranslate, paragraphStarts, parseSentences } from '../../features/translation/sentences'
import { useCopy } from '../../lib/useCopy'
import { focusTranslation, scrollIntoView } from '../../lib/scroll'
import { Paragraph } from '../sentences/Paragraph'
import { Sentence } from '../sentences/Sentence'

export function SentencesStep() {
  const { draft, confirmSentences } = useStore()
  const { copy, label } = useCopy<'sentences'>()

  const paragraphs = parseSentences(draft.sentences)
  const starts = paragraphStarts(paragraphs)
  const count = paragraphs.reduce((total, paragraph) => total + paragraph.length, 0)

  // Finishing the step opens the translation step; once that is rendered, go where "Continue translating" would go.
  const finish = () => {
    confirmSentences()
    requestAnimationFrame(() => {
      const next = nextSentenceToTranslate(draft.translations, count)
      if (next) {
        focusTranslation(next)
        return
      }
      // Every sentence is already completed: show the top of the translation step instead.
      const card = document.getElementById('translate-step')?.closest('section')
      if (card) scrollIntoView(card, 'start')
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-(--muted)">
        Check that the text was split correctly: {count} {count === 1 ? 'sentence' : 'sentences'} in {paragraphs.length}{' '}
        {paragraphs.length === 1 ? 'paragraph' : 'paragraphs'}.
      </p>

      {/* Sticks to the top of the page while the (long) list scrolls underneath. */}
      <div className="sticky top-0 z-10 -mx-4 flex flex-wrap gap-2 border-b border-(--line) bg-(--surface) px-4 py-3">
        {/*
        <button
          type="button"
          onClick={() => copy('sentences', draft.sentences)}
          className="rounded-md border border-(--line) px-4 py-2 text-sm hover:border-(--muted)"
        >
          {label('sentences', 'Copy for Google Sheet')}
        </button>
        */}
        <button type="button" onClick={finish} className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink)">
          Done - Sentences look correct
        </button>
      </div>

      <div>
        {paragraphs.map((paragraph, i) => (
          <Paragraph key={i} index={i + 1} total={paragraphs.length} firstSentence={starts[i] + 1} sentenceCount={paragraph.length} totalSentences={count}>
            {paragraph.map((sentence, j) => (
              <li key={j}>
                <Sentence number={starts[i] + j + 1} text={sentence} />
              </li>
            ))}
          </Paragraph>
        ))}
      </div>
      <button type="button" onClick={finish} className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink)">
        Done - Sentences look correct
      </button>
    </div>
  )
}
