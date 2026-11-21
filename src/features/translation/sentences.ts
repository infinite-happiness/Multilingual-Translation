// ss-standard enables the locale's abbreviation rules (e.g. "Dr." does not end a sentence).
const segmenter = new Intl.Segmenter('en-u-ss-standard', { granularity: 'sentence' })

/**
 * Splits text into paragraphs of sentences. Every line break (single or repeated) ends a paragraph, and
 * the sentences keep the exact characters that were pasted; only whitespace around them is dropped.
 */
export function splitParagraphs(text: string): string[][] {
  return text
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((paragraph) =>
      [...segmenter.segment(paragraph)]
        .map((part) => part.segment.trim())
        .filter(Boolean),
    )
}

/** One sentence per line, with an empty line after every paragraph, ready to paste into a Google Sheet. */
export function sentencesText(text: string): string {
  return formatParagraphs(splitParagraphs(text))
}

/** One sentence per line, with an empty line after every paragraph. */
export const formatParagraphs = (paragraphs: string[][]): string => paragraphs.flatMap((paragraph) => [...paragraph, '']).join('\n')

/** Reads a sentence list (one sentence per line, empty lines between paragraphs) back into paragraphs. */
export function parseSentences(list: string): string[][] {
  return list
    .split(/\n\s*\n/)
    .map((block) => block.split('\n').filter((line) => line.trim()))
    .filter((paragraph) => paragraph.length > 0)
}

/** For each paragraph, how many sentences come before it, since the sentence numbering continues across paragraphs. */
export function paragraphStarts(paragraphs: string[][]): number[] {
  let before = 0
  return paragraphs.map((paragraph) => {
    const start = before
    before += paragraph.length
    return start
  })
}

/**
 * The number of the sentence to work on next: the first one without any translation text, and once every
 * sentence has text, the first one that is not completed yet. Undefined when every sentence is completed.
 */
export function nextSentenceToTranslate(translations: Record<number, { text: string; completed: boolean }>, total: number): number | undefined {
  const numbers = Array.from({ length: total }, (_, i) => i + 1)
  return numbers.find((n) => !translations[n]?.text.trim()) ?? numbers.find((n) => !translations[n]?.completed)
}
