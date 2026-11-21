import { splitWords } from './words'
import { sameLanguage } from './languages'
import { sheetCell } from './sheet'
import { displayWord, wordKey, type Dictionary } from '../dictionary/types'

export interface GlossaryEntry {
  word: string
  /** The translations in priority order. */
  translations: string[]
}

/** The words of the original sentences that are in the dictionary with the given language: each word once, alphabetical. */
export function glossaryFor(language: string, paragraphs: string[][], dictionary: Dictionary | undefined): GlossaryEntry[] {
  if (!dictionary) return []
  const seen = new Set<string>()
  const entries: GlossaryEntry[] = []
  for (const sentence of paragraphs.flat()) {
    for (const piece of splitWords(sentence)) {
      if (!piece.word) continue
      const key = wordKey(piece.text)
      const entry = dictionary.words[key]
      if (!entry || seen.has(key) || !sameLanguage(entry.language, language)) continue
      seen.add(key)
      entries.push({ word: displayWord(entry), translations: entry.translations.map((t) => t.text).filter(Boolean) })
    }
  }
  return entries.sort((a, b) => a.word.localeCompare(b.word))
}

/** One line per word: "word: translation, translation". */
export const glossaryText = (entries: GlossaryEntry[]): string =>
  entries.map((e) => (e.translations.length > 0 ? `${e.word}: ${e.translations.join(', ')}` : e.word)).join('\n')

/** One row per word for a Google Sheet: the word, then each translation in its own column. */
export const glossarySheet = (entries: GlossaryEntry[]): string =>
  entries.map((e) => [e.word, ...e.translations].map(sheetCell).join('\t')).join('\n')
