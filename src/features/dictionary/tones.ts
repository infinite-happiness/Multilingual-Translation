import type { SourceLanguage } from '../../store/useStore'

/** The names of the word colors; each one is a theme color `--tone-<name>` in index.css. */
export type Tone = 'yellow' | 'orange' | 'green' | 'pink' | 'purple' | 'red' | 'teal'

const OTHER_TONES: Tone[] = ['green', 'pink', 'purple', 'red', 'teal']

/**
 * Gives every language its own color, keyed by the lower-case language name: the first translated-from source language is
 * yellow, the first not-translated source language is orange, and all other languages get one of the remaining colors.
 */
export function languageTones(sources: SourceLanguage[], target: string, wordLanguages: string[]): Record<string, Tone> {
  const tones: Record<string, Tone> = {}
  const firstTranslated = sources.find((s) => s.translate)
  const firstUntranslated = sources.find((s) => !s.translate)
  if (firstTranslated) tones[firstTranslated.name.toLowerCase()] = 'yellow'
  if (firstUntranslated) tones[firstUntranslated.name.toLowerCase()] = 'orange'

  let next = 0
  for (const name of [...sources.map((s) => s.name), target, ...wordLanguages]) {
    const key = name.toLowerCase()
    if (key && !(key in tones)) tones[key] = OTHER_TONES[next++ % OTHER_TONES.length]
  }
  return tones
}
