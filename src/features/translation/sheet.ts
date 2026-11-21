import type { SentenceTranslation } from '../../store/useStore'

export type SheetColumns = 'original' | 'translation' | 'all'

/** The word in the fourth column of a sentence that is completed; the other sentences leave it empty. */
export const COMPLETED = 'completed'

// A cell is quoted when it holds a tab, line break or quote, so a spreadsheet keeps it in one cell and rows stay aligned.
export const sheetCell = (text: string) => (/["\t\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text)

/**
 * Clipboard text for pasting into a Google Sheet: one row per sentence and an empty row after every paragraph,
 * with the original, the translation, or all four columns: the original, the translation, the comment and whether the sentence is completed. Sentences without a translation, comment or completion get an empty cell.
 */
export function sheetText(paragraphs: string[][], translations: Record<number, SentenceTranslation>, columns: SheetColumns): string {
  const rows: string[] = []
  let number = 0
  for (const paragraph of paragraphs) {
    for (const sentence of paragraph) {
      const entry = translations[++number]
      const translation = entry?.text ?? ''
      rows.push(
        columns === 'original' ? sheetCell(sentence) : columns === 'translation' ? sheetCell(translation) : [sheetCell(sentence), sheetCell(translation), sheetCell(entry?.comment ?? ''), entry?.completed ? COMPLETED : ''].join('\t'),
      )
    }
    rows.push('')
  }
  return rows.join('\n')
}
