export type StepKey =
  | 'intro' | 'title' | 'folder' | 'language' | 'text' | 'sentences' | 'prompt' | 'translate' | 'errors' | 'final' | 'backup' | 'audiobook'

export interface StepDef {
  key: StepKey
  title: string
  /** When false the step can be opened before the steps ahead of it are done. */
  gated?: boolean
}

/** The order of this list is the order of the steps; displayed numbers are derived from it. */
export const STEPS: readonly StepDef[] = [
  { key: 'intro', title: 'Introduction' },
  { key: 'title', title: 'Title' },
  { key: 'folder', title: 'Folder' },
  { key: 'language', title: 'Languages' },
  { key: 'text', title: 'Paste the text' },
  { key: 'sentences', title: 'Sentences' },
  // Parked: the translation prompt step. Restore this line and add its component in App.tsx to bring it back.
  // { key: 'prompt', title: 'Translation prompt' },
  { key: 'translate', title: 'Sentence-by-sentence translation' },
  { key: 'errors', title: 'Error check' },
  { key: 'final', title: 'Final text' },
  { key: 'backup', title: 'Backup', gated: false },
  { key: 'audiobook', title: 'Audiobook', gated: false },
]

/** The key of the step that follows the given one, if there is one. */
export const nextStep = (key: StepKey): StepKey | undefined => STEPS[STEPS.findIndex((s) => s.key === key) + 1]?.key
