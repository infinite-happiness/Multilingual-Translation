import { useMemo, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { nextSentenceToTranslate, paragraphStarts, parseSentences } from '../../features/translation/sentences'
import { sentencePrompt } from '../../features/translation/prompts'
import { languageTones } from '../../features/dictionary/tones'
import { wordKey } from '../../features/dictionary/types'
import { copyText } from '../../lib/clipboard'
import { focusOpenStep, focusTranslation, scrollIntoView } from '../../lib/scroll'
import { Paragraph } from '../sentences/Paragraph'
import { Sentence } from '../sentences/Sentence'
import { WordDialog } from '../dictionary/WordDialog'

export function TranslateStep() {
  const { draft, setTranslation, setCompleted, setComment, confirmTranslate, toggleStep } = useStore()
  const [word, setWord] = useState<string | null>(null)
  const [copied, setCopied] = useState<number | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const bottom = useRef<HTMLDivElement>(null)

  const dictionary = useStore((s) => s.dictionaries[draft.language])
  const tones = useMemo(
    () => languageTones(draft.sourceLanguages, draft.language, Object.values(dictionary?.words ?? {}).map((w) => w.language)),
    [draft.sourceLanguages, draft.language, dictionary],
  )
  const untranslated = new Set(draft.sourceLanguages.filter((s) => !s.translate).map((s) => s.name.toLowerCase()))
  // The color of a word comes from the language of its dictionary entry. Inside a translation only the languages that are
  // kept untranslated are colored, so the rest of the translation stays blue.
  const toneOf = (word: string, onlyUntranslated: boolean) => {
    const language = dictionary?.words[wordKey(word)]?.language.toLowerCase()
    if (!language || (onlyUntranslated && !untranslated.has(language))) return null
    return tones[language] ?? null
  }
  const paragraphs = parseSentences(draft.sentences)
  const starts = paragraphStarts(paragraphs)
  const total = paragraphs.reduce((sum, paragraph) => sum + paragraph.length, 0)
  const completed = Object.values(draft.translations).filter((t) => t.completed).length
  const allCompleted = total > 0 && completed === total

  const copyPrompt = async (n: number, sentence: string) => {
    if (!(await copyText(sentencePrompt(draft.language, draft.sourceLanguages, sentence)))) return
    setCopied(n)
    window.setTimeout(() => setCopied(null), 2000)
  }

  const nextToTranslate = nextSentenceToTranslate(draft.translations, total)
  const continueTranslating = () => {
    if (nextToTranslate) focusTranslation(nextToTranslate)
  }
  const finish = () => {
    confirmTranslate()
    focusOpenStep()
  }

  // The step card that wraps this step, used as the "top" of the long list.
  const card = () => root.current?.closest('section')
  const goTop = () => {
    const el = card()
    if (el) scrollIntoView(el, 'start')
  }
  const goBottom = () => bottom.current && scrollIntoView(bottom.current, 'end')
  // Collapses the step and keeps its (now short) card in view instead of leaving the page scrolled far below it.
  const minimize = () => {
    const el = card()
    toggleStep('translate')
    if (el) requestAnimationFrame(() => scrollIntoView(el, 'nearest'))
  }
  const secondary = 'rounded-md border border-(--line) px-4 py-2 text-sm hover:border-(--muted)'

  return (
    <div ref={root} id="translate-step" className="space-y-4">
      <p className="text-sm text-(--muted)">
        {completed} of {total} {total === 1 ? 'sentence' : 'sentences'} completed.
      </p>

      {/* Sticks to the top of the page while the (long) list scrolls underneath. */}
      <div className="sticky top-0 z-10 -mx-4 flex flex-wrap gap-2 border-b border-(--line) bg-(--surface) px-4 py-3">
        {/* Once every sentence is completed, finishing the step takes the place of continuing. */}
        {allCompleted ? (
          <button type="button" onClick={finish} className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink)">
            Translation finished
          </button>
        ) : (
          <button type="button" onClick={continueTranslating} disabled={!nextToTranslate} className={`${secondary} disabled:opacity-40`}>
            Continue translating
          </button>
        )}
        <button type="button" onClick={goTop} className={secondary}>
          Go to top
        </button>
        <button type="button" onClick={goBottom} className={secondary}>
          Go to bottom
        </button>
        <button type="button" onClick={minimize} className={secondary}>
          Minimize
        </button>
      </div>

      <div>
        <ul className="max-w-prose list-disc space-y-2 pl-5 pb-10 marker:text-(--accent)">
          <li>
            To translate a sentence, press the button <strong>Copy prompt</strong> and paste the prompt into your selected AI for translation.          </li>
          <li>
            Add the translated sentence below the original sentence, and press the <strong>Complete</strong> button when you are done translating the sentence.
          </li>
          <li>Click a word in the original language(s) to add it to a dictionary and glossary. The dictionaries contain all words translated into a language, whereas glossaries only contain words that belong to a translated text or folder. This way you can user the same dictionary for translating many books, and only add the words that belong to a book to its glossary.</li>
        </ul>

        {paragraphs.map((paragraph, i) => (
          <Paragraph key={i} index={i + 1} total={paragraphs.length} firstSentence={starts[i] + 1} sentenceCount={paragraph.length} totalSentences={total}>
            {paragraph.map((sentence, j) => {
              // The sentence number is also the key of its translation.
              const n = starts[i] + j + 1
              const translation = draft.translations[n]
              return (
                <li key={j}>
                  <Sentence
                    number={n}
                    text={sentence}
                    expanded={{
                      translation: translation?.text ?? '',
                      completed: translation?.completed ?? false,
                      promptCopied: copied === n,
                      onTranslationChange: (text) => setTranslation(n, text),
                      onCompletedChange: (value) => setCompleted(n, value),
                      comment: translation?.comment ?? '',
                      onCommentChange: (text) => setComment(n, text),
                      onCopyPrompt: () => copyPrompt(n, sentence),
                      onWordClick: setWord,
                      originalTone: (word) => toneOf(word, false),
                      translationTone: (word) => toneOf(word, true),
                    }}
                  />
                </li>
              )
            })}
          </Paragraph>
        ))}
      </div>

      {/* The end of the list, which "Go to bottom" scrolls to. */}
      <div ref={bottom} />

      <WordDialog word={word} language={draft.language} onClose={() => setWord(null)} />
    </div>
  )
}
