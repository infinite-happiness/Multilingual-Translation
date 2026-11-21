import { parseTsvRows } from '../../lib/tsv'
import type { SentenceTranslation } from '../../store/useStore'
import { COMPLETED } from './sheet'

const TRUE_VALUES = [COMPLETED, 'true', 'yes', 'y', '1', 'x', '✓']
const isCompleted = (cell: string) => TRUE_VALUES.includes(cell.trim().toLowerCase())

export interface SheetPaste {
  paragraphs: string[][]
  /** Translations, comments and completion by sentence number, from the optional second to fourth columns. */
  translations: Record<number, SentenceTranslation>
  /** How many columns hold data. */
  columns: number
}

/**
 * Reads a list pasted from a Google Sheet: the first column holds the sentences, an optional second column their
 * translations, an optional third column their comments, an optional fourth column that says "completed" for finished sentences, and an empty row ends a paragraph.
 */
export function parseSheetPaste(text: string): SheetPaste {
  const rows = parseTsvRows(text)
  const columns = Math.max(0, ...rows.map((row) => row.reduce((last, cell, i) => (cell.trim() ? i + 1 : last), 0)))

  const paragraphs: string[][] = []
  const translations: Record<number, SentenceTranslation> = {}
  let current: string[] = []
  let number = 0
  for (const row of rows) {
    const original = (row[0] ?? '').trim()
    if (!original) {
      if (current.length > 0) paragraphs.push(current)
      current = []
      continue
    }
    current.push(original)
    number += 1
    const translation = (row[1] ?? '').trim()
    const comment = (row[2] ?? '').trim()
    // A sentence can only be completed when it has a translation.
    const completed = !!translation && isCompleted(row[3] ?? '')
    if (translation || comment) translations[number] = { text: translation, completed, ...(comment && { comment }) }
  }
  if (current.length > 0) paragraphs.push(current)
  return { paragraphs, translations, columns }
}
