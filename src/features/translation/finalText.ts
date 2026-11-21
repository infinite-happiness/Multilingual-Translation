import type { SentenceTranslation } from '../../store/useStore'

/**
 * The finished translation as paragraphs of normal text: the translated sentences of each paragraph joined with spaces.
 * Sentences without a translation are left out, and so are paragraphs where none is translated.
 */
export function finalParagraphs(paragraphs: string[][], translations: Record<number, SentenceTranslation>): string[] {
  let number = 0
  return paragraphs
    .map((paragraph) =>
      paragraph
        .map(() => (translations[++number]?.text ?? '').replace(/\s*\n\s*/g, ' ').trim())
        .filter(Boolean)
        .join(' '),
    )
    .filter(Boolean)
}
