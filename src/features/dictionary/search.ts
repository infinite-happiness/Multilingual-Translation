import { displayWord, type DictWord } from './types'

/** True when the query occurs in the word, its translations, their examples or its custom field values (ignoring case). */
export function entryMatches(entry: DictWord, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const text = [
    displayWord(entry),
    entry.language,
    ...entry.translations.flatMap((t) => [t.text, t.exampleOriginal, t.exampleTranslated]),
    ...Object.values(entry.custom),
  ]
  return text.some((part) => part.toLowerCase().includes(q))
}
