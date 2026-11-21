import { useStore } from '../store/useStore'

/** Serializes everything the app stores in the same shape the persist middleware writes to localStorage. */
export function createBackup() {
  const json = JSON.stringify({ state: useStore.getState(), version: useStore.persist.getOptions().version }, null, 2)
  const date = new Date().toISOString().slice(0, 10)
  return { filename: `translations-backup-${date}.json`, json }
}

type Host = { use: (name: string) => Promise<{ save: (file: { filename: string; data: string }) => Promise<unknown> } | null> }

/** Preview only: the sandboxed preview ignores plain download links, so the file goes through the host's download prompt. */
export async function offerInPreview(filename: string, data: string) {
  const host = (window as unknown as { claude?: Host }).claude
  const downloads = await host?.use('downloads')
  await downloads?.save({ filename, data }).catch(() => undefined)
}

export interface ParsedBackup {
  state: Record<string, unknown>
  version: number
  translations: number
  words: number
}

/** Reads the text of a backup file and checks that it was made by this app; throws an error with a readable message if not. */
export function parseBackup(text: string): ParsedBackup {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('This file is not a backup file: it is not valid JSON.')
  }
  const { state, version } = (data ?? {}) as { state?: Record<string, unknown>; version?: unknown }
  if (!state || typeof state !== 'object' || typeof version !== 'number' || !Array.isArray(state.history)) {
    throw new Error('This file does not look like a backup made by this app.')
  }
  if (version > (useStore.persist.getOptions().version ?? 0)) throw new Error('This backup was made by a newer version of the app.')

  const dictionaries = (state.dictionaries ?? {}) as Record<string, { words?: object }>
  const words = Object.values(dictionaries).reduce((total, dictionary) => total + Object.keys(dictionary?.words ?? {}).length, 0)
  return { state, version, translations: state.history.length, words }
}

/** Replaces everything that is stored with the contents of the backup, migrating it first if it comes from an older version. */
export async function restoreBackup(backup: ParsedBackup) {
  localStorage.setItem(useStore.persist.getOptions().name!, JSON.stringify({ state: backup.state, version: backup.version }))
  await useStore.persist.rehydrate()
}
