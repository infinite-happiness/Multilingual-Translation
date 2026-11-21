import { parseTsvRows } from '../../lib/tsv'
import { startsCapitalized, wordKey, type DictTranslation, type DictWord } from './types'

/**
 * What a pasted column becomes, as a string: 'ignore', 'word', 'newField', `translation:2`, `original:2`,
 * `translated:2` (the translation and its two examples in group 2), 'language' or `field:Name` (an existing custom field).
 */
export type Target = string

/** Parses text copied from a spreadsheet into rows of cells, without the empty rows. */
export const parseTsv = (text: string): string[][] => parseTsvRows(text).filter((row) => row.some((cell) => cell.trim() !== ''))

export const columnCount = (rows: string[][]) => Math.max(0, ...rows.map((r) => r.length))

/** The dictionary copy button puts "Word" in the first cell of its header row, so that marks a header row. */
export const looksLikeHeader = (rows: string[][]) => rows[0]?.[0]?.trim().toLowerCase() === 'word'

/** The translation group a target belongs to, or 0 when it does not belong to one. */
export const groupOf = (target: Target) => (/^(translation|original|translated):(\d+)$/.exec(target)?.[2] ? Number(target.split(':')[1]) : 0)

/**
 * The first guess for what each pasted column is. With a header row, columns are matched by the names the dictionary copy
 * button writes; in that layout any other named column becomes a new custom field. Without one only the first column is used (as Word).
 */
export function initialMapping(header: string[] | null, columns: number, fields: string[], language: string): Target[] {
  const first = (i: number): Target => (i === 0 ? 'word' : 'ignore')
  if (!header) return Array.from({ length: columns }, (_, i) => first(i))

  const exportLayout = looksLikeHeader([header])
  const group = (name: string, prefix: string) => (name.startsWith(prefix) && /^\d+$/.test(name.slice(prefix.length)) ? name.slice(prefix.length) : null)

  return Array.from({ length: columns }, (_, i) => {
    const name = (header[i] ?? '').trim()
    const lower = name.toLowerCase()
    if (!exportLayout) return first(i)
    if (lower === 'word') return 'word'
    if (lower === 'language') return 'language'
    const translation = group(lower, 'translation ')
    if (translation) return `translation:${translation}`
    const original = group(lower, 'example (original) ')
    if (original) return `original:${original}`
    const translated = group(lower, `example (${language.toLowerCase()}) `)
    if (translated) return `translated:${translated}`
    const field = fields.find((f) => f.toLowerCase() === lower)
    if (field) return `field:${field}`
    return name ? 'newField' : 'ignore'
  })
}

/** Turns the pasted rows into dictionary entries following the column mapping. Needs exactly one column mapped to Word. */
export function buildEntries(
  rows: string[][],
  mapping: Target[],
  header: string[] | null,
  existingFields: string[],
): { entries: DictWord[]; newFields: string[] } {
  const wordColumn = mapping.indexOf('word')
  const newFields: string[] = []

  // A "new custom field" column is named after its header and reuses an existing field of the same name.
  const fieldOfColumn = mapping.map((target, i) => {
    if (target.startsWith('field:')) return target.slice('field:'.length)
    if (target !== 'newField') return null
    const name = (header?.[i] ?? '').trim() || `Column ${i + 1}`
    const known = [...existingFields, ...newFields].find((f) => f.toLowerCase() === name.toLowerCase())
    if (known) return known
    newFields.push(name)
    return name
  })

  const entries: DictWord[] = []
  for (const row of rows) {
    const word = (row[wordColumn] ?? '').trim()
    if (!word) continue

    const groups = new Map<number, { text: string; original: string; translated: string }>()
    const custom: Record<string, string> = {}
    let language = ''
    mapping.forEach((target, i) => {
      const value = (row[i] ?? '').trim()
      if (target === 'language') {
        language = value
        return
      }
      const field = fieldOfColumn[i]
      if (field) {
        custom[field] = value
        return
      }
      const number = groupOf(target)
      if (!number) return
      const current = groups.get(number) ?? { text: '', original: '', translated: '' }
      if (target.startsWith('translation:')) current.text = value
      else if (target.startsWith('original:')) current.original = value
      else current.translated = value
      groups.set(number, current)
    })

    const translations: DictTranslation[] = [...groups.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, g]) => ({ id: crypto.randomUUID(), text: g.text, exampleOriginal: g.original, exampleTranslated: g.translated }))
      .filter((t) => t.text || t.exampleOriginal || t.exampleTranslated)
    entries.push({ word, capitalized: startsCapitalized(word), language, translations, custom })
  }
  return { entries, newFields }
}

/** Splits entries into the ones to import and the words to skip: words already in the dictionary or repeated in the pasted data. */
export function planImport(entries: DictWord[], existing: Record<string, DictWord>): { fresh: DictWord[]; skipped: string[] } {
  const fresh: DictWord[] = []
  const skipped: string[] = []
  const seen = new Set<string>()
  for (const entry of entries) {
    const key = wordKey(entry.word)
    if (key in existing || seen.has(key)) skipped.push(entry.word)
    else {
      seen.add(key)
      fresh.push(entry)
    }
  }
  return { fresh, skipped }
}
