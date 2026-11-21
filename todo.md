# Translation Tool – TODO

## Setup
- Add shadcn/ui components (the CLI could not be reached from the sandbox; currently plain Tailwind)
- Configure GitHub Pages deployment (`base` path + GitHub Action)

## Steps
Steps are listed by name; their order lives in `src/features/translation/steps.ts`.
- Audiobook: placeholder step exists with Gemini (audio of the translation) and Phonemes (pronunciation); both still to build

## Parked
- Translation prompt step: built from the target language and the sentence list, with a copy button
  (commented out in `steps.ts`; uncomment the entry and add a component to bring it back)

## Persistence
- Reopen a translation from the sidebar with all of its steps restored (currently covers the steps up to Sentence-by-sentence translation)

## Open questions
- Refine the sentence splitting rules after trying real texts (abbreviations, verse numbers such as ॥ 2.47 ॥)
- What should the Final text formatting look like?
