import type { SentenceTranslation, SourceLanguage } from '../../store/useStore'

const SPLIT_PROMPT =
  'Break down this text into a list of sentences, exactly as they are, with the exact same character codes. ' +
  'Create an empty line at the end of each paragraph, so that when copy-pasting into a Google Sheet the empty lines will be empty there too.'

/** The prompt that asks an AI to split the text, followed by the text itself. */
export const splitPromptWithText = (text: string) => `${SPLIT_PROMPT}\n\n${text}`

/** "English", "English and Spanish", "English, Spanish and French". */
const joinNames = (names: string[]) => (names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`)

/** The prompt for translating a single sentence, followed by the sentence itself. Only the ticked source languages are mentioned. */
export function sentencePrompt(language: string, sourceLanguages: SourceLanguage[], sentence: string) {
  const names = joinNames(sourceLanguages.filter((s) => s.translate).map((s) => s.name))
  const terms = names ? `${names} terms` : 'terms'
  const onlyList = names ? `Only list ${names} terms.` : 'Only list terms that need translating.'
  return `Translate this sentence into ${language}, with a table of alternative translations for ambiguous ${terms}. ${onlyList}\n\n${sentence}`
}

/** The translated sentences as numbered lines, keeping their sentence numbers; untranslated sentences are left out. */
export function numberedTranslations(translations: Record<number, SentenceTranslation>): string[] {
  return Object.entries(translations)
    .map(([number, translation]) => [Number(number), translation.text.replace(/\s*\n\s*/g, ' ').trim()] as const)
    .filter(([, text]) => text !== '')
    .sort(([a], [b]) => a - b)
    .map(([number, text]) => `${number}. ${text}`)
}

/** The prompt for checking the translation for errors, followed by the numbered sentences. */
export const errorCheckPrompt = (language: string, lines: string[]) =>
  `Find spelling, formatting and grammatical errors in this ${language} text. Only list the sentences that have errors, and keep their numbers.\n\n${lines.join('\n')}`
