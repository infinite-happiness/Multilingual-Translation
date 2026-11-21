# Translation Tool – TODO

## Setup
- Add shadcn/ui components (the CLI could not be reached from the sandbox; currently plain Tailwind)
- Configure GitHub Pages deployment (`base` path + GitHub Action)

## Steps
Steps are listed by name; their order lives in `src/features/translation/steps.ts`.
- Audiobook: placeholder step exists with Gemini (audio of the translation) and Phonemes (pronunciation); both still to build
- Backup: button that exports to Google Drive (automatic backup later). One Google Sheet per folder, named like the folder, with a tab per translation and per glossary; a translation without a folder gets its own sheet and glossaries
  - Sign-in: Google Identity Services token client with an OAuth Client ID in `.env.local`; never in the store, since the JSON backup contains the whole store
  - Decide first: what "glossary" means (per-translation glossary or the whole dictionary), glossary tabs per translation or per folder, whether the dictionary is exported too, destination Drive folder (picked or created by the app), what a second click does (update or create new)
  - Write cell values as raw text so `=` or `-` at the start is not turned into a formula; sanitize and de-duplicate tab names
  - Hide the button in preview mode (`__PREVIEW__`)

## Parked
- Translation prompt step: built from the target language and the sentence list, with a copy button
  (commented out in `steps.ts`; uncomment the entry and add a component to bring it back)

## Persistence
- Reopen a translation from the sidebar with all of its steps restored (currently covers the steps up to Sentence-by-sentence translation)

## Open questions
- Refine the sentence splitting rules after trying real texts (abbreviations, verse numbers such as ॥ 2.47 ॥)
- What should the Final text formatting look like?
