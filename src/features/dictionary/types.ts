export interface DictTranslation {
  id: string
  text: string
  /** Example sentence in the original language. */
  exampleOriginal: string
  /** Example sentence in the language of the translation. */
  exampleTranslated: string
}

export interface DictWord {
  /** The word as it was first clicked; use `displayWord` to show it. */
  word: string
  /** Whether the word is shown with a capital first letter. */
  capitalized: boolean
  /** The language the word is in; empty when not set. */
  language: string
  /** Ordered by priority: the first translation is the most important one. */
  translations: DictTranslation[]
  /** Values of the dictionary's custom fields, by field name. */
  custom: Record<string, string>
}

export interface Dictionary {
  /** Names of the custom fields that every word of this dictionary has. */
  fields: string[]
  words: Record<string, DictWord>
}

/** Words are stored under their lower-case form so capital letters do not create duplicate entries. */
export const wordKey = (word: string) => word.toLowerCase()

/** True when the first letter is a capital, which decides whether a new entry starts as capitalized. */
export const startsCapitalized = (word: string) => /^\p{Lu}/u.test(word)

/** The word with its first letter in the case the entry asks for. */
export function displayWord(entry: Pick<DictWord, 'word' | 'capitalized'>): string {
  const [first = '', ...rest] = [...entry.word]
  return (entry.capitalized ? first.toUpperCase() : first.toLowerCase()) + rest.join('')
}
