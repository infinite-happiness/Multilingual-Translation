import type { HistoryEntry, SourceLanguage } from '../../store/useStore'

/** Language names are compared without regard to capital letters. */
export const sameLanguage = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

/** Every language that gets a button in the language step, including those of translations saved before languages were tracked. */
export const usedLanguages = (languages: string[], history: HistoryEntry[]): string[] =>
  [...new Set([...languages, ...history.map((h) => h.language)].filter(Boolean))]

/** The source languages used in earlier translations, with the tick they had most recently (the newest entries come first). */
export function knownSourceLanguages(history: HistoryEntry[]): SourceLanguage[] {
  const known: SourceLanguage[] = []
  for (const entry of history) {
    for (const source of entry.sourceLanguages) {
      if (!known.some((k) => sameLanguage(k.name, source.name))) known.push(source)
    }
  }
  return known
}

/** The saved translations whose target language is the given one. */
export const translationsUsing = (history: HistoryEntry[], language: string): HistoryEntry[] =>
  history.filter((h) => sameLanguage(h.language, language))

/** "From English, Sanskrit · To Swedish"; without source languages just "To Swedish". */
export const languagesSummary = (language: string, sourceLanguages: SourceLanguage[]): string => {
  const from = sourceLanguages.map((s) => s.name).join(', ')
  return `${from ? `From ${from} · ` : ''}To ${language}`
}
