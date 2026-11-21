import { sheetCell } from '../translation/sheet'
import { displayWord, type Dictionary } from './types'

/**
 * Clipboard text for pasting a dictionary into a Google Sheet: a header row, then one row per word (alphabetical) with
 * its language and a group of columns for each translation in priority order, followed by the custom fields.
 */
export function dictionarySheetText(dictionary: Dictionary, language: string): string {
  const words = Object.values(dictionary.words).sort((a, b) => displayWord(a).localeCompare(displayWord(b)))
  const groups = Math.max(0, ...words.map((w) => w.translations.length))
  const range = Array.from({ length: groups }, (_, i) => i)

  const header = [
    'Word',
    'Language',
    ...range.flatMap((i) => [`Translation ${i + 1}`, `Example (original) ${i + 1}`, `Example (${language}) ${i + 1}`]),
    ...dictionary.fields,
  ]
  const rows = words.map((w) => [
    displayWord(w),
    w.language,
    ...range.flatMap((i) => [w.translations[i]?.text ?? '', w.translations[i]?.exampleOriginal ?? '', w.translations[i]?.exampleTranslated ?? '']),
    ...dictionary.fields.map((field) => w.custom[field] ?? ''),
  ])
  return [header, ...rows].map((row) => row.map(sheetCell).join('\t')).join('\n')
}
