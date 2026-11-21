import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nextStep, type StepKey } from '../features/translation/steps'
import { sentencesText } from '../features/translation/sentences'
import { sameLanguage } from '../features/translation/languages'
import { emptyPublishing, type Publishing } from '../features/translation/publishing'
import { startsCapitalized, wordKey, type DictWord, type Dictionary } from '../features/dictionary/types'

export interface SentenceTranslation {
  text: string
  completed: boolean
  /** A note on the sentence; a sentence with a comment is framed in red. */
  comment?: string
}

/** A language the text is written in; only ticked ones are translated, the rest is kept as it is. */
export interface SourceLanguage {
  name: string
  translate: boolean
}

/** The languages shared by the translations of a folder that use them. */
export interface FolderLanguages {
  language: string
  sourceLanguages: SourceLanguage[]
}

export interface Draft {
  id: string
  title: string
  /** Folder name; an empty string means the translation is not in a folder. */
  folder: string
  language: string
  sourceLanguages: SourceLanguage[]
  /** Whether the languages are the ones shared by the translation's folder, so the Languages step is skipped. */
  useFolderLanguages: boolean
  /** Optional publishing data, shown in the final step. */
  publishing: Publishing
  /** Whether the publishing data is the one shared by the translation's folder. */
  useFolderPublishing: boolean
  text: string
  /** The sentence list: one sentence per line, with an empty line after each paragraph. */
  sentences: string
  /** Translations by sentence number (starting at 1). */
  translations: Record<number, SentenceTranslation>
  /** Keys of the completed steps. */
  done: StepKey[]
  /** Keys of the steps currently expanded. */
  open: StepKey[]
  /** Element id of the field that was last focused. */
  focus: string
}
export interface HistoryEntry {
  id: string
  title: string
  folder: string
  language: string
  sourceLanguages: SourceLanguage[]
  useFolderLanguages: boolean
  publishing: Publishing
  useFolderPublishing: boolean
  text: string
  sentences: string
  translations: Record<number, SentenceTranslation>
  createdAt: number
  /** Progress, panel and focus state, so reopening a translation looks the way it was left. */
  done: StepKey[]
  open: StepKey[]
  focus: string
}

const toEntry = (d: Draft, createdAt: number): HistoryEntry => ({
  id: d.id, title: d.title, folder: d.folder, language: d.language, sourceLanguages: d.sourceLanguages, useFolderLanguages: d.useFolderLanguages, publishing: d.publishing, useFolderPublishing: d.useFolderPublishing, text: d.text, sentences: d.sentences, translations: d.translations, createdAt, done: d.done, open: d.open, focus: d.focus,
})

// Stores the draft in the list, keeping the position and creation time of an existing entry.
const upsertEntry = (history: HistoryEntry[], d: Draft): HistoryEntry[] => {
  const existing = history.find((h) => h.id === d.id)
  return existing ? history.map((h) => (h.id === d.id ? toEntry(d, h.createdAt) : h)) : [toEntry(d, Date.now()), ...history]
}

// Updates the entry of the draft only if it already exists (a draft is listed once its title is confirmed).
const syncEntry = (history: HistoryEntry[], d: Draft): HistoryEntry[] =>
  history.map((h) => (h.id === d.id ? toEntry(d, h.createdAt) : h))

// Marks a step as done, collapses the others and opens the step that follows it.
const completeStep = (d: Draft, key: StepKey): Draft => {
  const next = nextStep(key)
  return { ...d, done: d.done.includes(key) ? d.done : [...d.done, key], open: next ? [next] : [] }
}

// A new sentence list invalidates the translations made for the old one.
const resetTranslations = (d: Draft): Draft => ({ ...d, translations: {}, done: d.done.filter((key) => key !== 'translate') })

const emptyDraft = (): Draft => ({ id: crypto.randomUUID(), title: '', folder: '', language: '', sourceLanguages: [], useFolderLanguages: false, publishing: emptyPublishing(), useFolderPublishing: false, text: '', sentences: '', translations: {}, done: [], open: ['intro'], focus: '' })

interface Store {
  theme: 'dark' | 'light'
  languages: string[]
  folders: string[]
  /** Names of the folders expanded in the sidebar. */
  openFolders: string[]
  /** The shared languages of folders, by folder name. */
  folderLanguages: Record<string, FolderLanguages>
  /** The shared publishing data of folders, by folder name. */
  folderPublishing: Record<string, Publishing>
  /** Dictionaries by language. */
  dictionaries: Record<string, Dictionary>
  history: HistoryEntry[]
  draft: Draft
  setTheme: (t: 'dark' | 'light') => void
  toggleStep: (key: StepKey) => void
  setFocus: (id: string) => void
  toggleFolder: (name: string) => void
  saveWord: (language: string, fields: string[], entry: DictWord) => void
  deleteTranslation: (id: string) => void
  deleteFolder: (name: string) => void
  deleteDictionary: (language: string) => void
  deleteWord: (language: string, word: string) => void
  removeLanguage: (name: string) => void
  importWords: (language: string, entries: DictWord[], newFields: string[]) => void
  confirmIntro: () => void
  confirmTitle: (title: string, publishing: Publishing, useFolderPublishing: boolean) => void
  confirmFolder: (folder: string) => void
  confirmLanguages: (language: string, sourceLanguages: SourceLanguage[], useFolderLanguages: boolean) => void
  confirmText: (text: string) => void
  confirmSheet: (text: string, sentences: string, translations: Record<number, SentenceTranslation>) => void
  confirmSentences: () => void
  setTranslation: (n: number, text: string) => void
  setCompleted: (n: number, completed: boolean) => void
  setComment: (n: number, comment: string) => void
  confirmTranslate: () => void
  confirmErrors: () => void
  newDraft: () => void
  openEntry: (e: HistoryEntry) => void
}

// Saves from before version 4 hold step numbers instead of keys; this is the numbering they used.
const LEGACY_KEYS: StepKey[] = ['intro', 'title', 'folder', 'language', 'text', 'sentences', 'prompt', 'translate', 'errors', 'final']
type Legacy = Partial<Omit<Store, 'history' | 'draft'>> & {
  history?: (Omit<HistoryEntry, 'done' | 'open' | 'sentences' | 'translations' | 'sourceLanguages' | 'useFolderLanguages' | 'publishing' | 'useFolderPublishing'> & { done?: number; open?: number[] })[]
  draft?: Omit<Draft, 'done' | 'open' | 'sentences' | 'translations'> & { done: number; open: number[] }
}

// Translations saved before source languages existed were translated with English as the only source language.
const assumedSources = (language: string): SourceLanguage[] => (language ? [{ name: 'English', translate: true }] : [])

// Converts saves that hold step numbers (before version 4) to step keys. Saves from before version 3 lack the
// introduction step and saves from before version 2 also lack the folder step, so their numbers are first
// brought to the numbering of version 3.
const fromNumbers = (old: Legacy, version: number): Store => {
  const toV3 = (n: number) => (version >= 3 ? n : version < 2 && n >= 2 ? n + 2 : n + 1)
  const keys = (numbers: number[] = []) => numbers.map((n) => LEGACY_KEYS[toV3(n) - 1]).filter(Boolean)
  const doneKeys = (count: number) => LEGACY_KEYS.slice(0, toV3(count))
  const history: HistoryEntry[] = (old.history ?? []).map((h) => ({
    ...h,
    title: h.title ?? '',
    folder: h.folder ?? '',
    sentences: '',
    translations: {},
    sourceLanguages: [],
    useFolderLanguages: false,
    publishing: emptyPublishing(),
    useFolderPublishing: false,
    done: h.done != null ? doneKeys(h.done) : LEGACY_KEYS.slice(0, h.text ? 5 : h.language ? 4 : 2),
    open: keys(h.open),
    focus: h.focus ?? '',
  }))
  const d = version >= 1 ? old.draft : undefined
  // A blank draft is replaced so that it starts with the introduction.
  const draft: Draft =
    d && d.done > 0
      ? { ...d, folder: d.folder ?? '', sentences: '', translations: {}, sourceLanguages: [], useFolderLanguages: false, publishing: emptyPublishing(), useFolderPublishing: false, done: doneKeys(d.done), open: keys(d.open), focus: d.focus ?? '' }
      : emptyDraft()
  return { ...old, history, draft, folders: old.folders ?? [], openFolders: old.openFolders ?? [] } as Store
}

// Words saved before version 9 have no capitalized flag or language: they keep the look they have and get no language.
const withWordDefaults = (dictionaries: Record<string, Dictionary>): Record<string, Dictionary> =>
  Object.fromEntries(
    Object.entries(dictionaries).map(([language, dictionary]) => [
      language,
      {
        ...dictionary,
        words: Object.fromEntries(
          Object.entries(dictionary.words).map(([key, w]) => [key, { ...w, capitalized: w.capitalized ?? startsCapitalized(w.word), language: w.language ?? '' }]),
        ),
      },
    ]),
  )

export const useStore = create<Store>()(
  persist(
    (set) => ({
      theme: 'dark',
      languages: [],
      folders: [],
      openFolders: [],
      folderLanguages: {},
      folderPublishing: {},
      dictionaries: {},
      history: [],
      draft: emptyDraft(),
      setTheme: (theme) => set({ theme }),
      toggleStep: (key) =>
        set((s) => {
          const open = s.draft.open.includes(key) ? s.draft.open.filter((x) => x !== key) : [...s.draft.open, key]
          const draft = { ...s.draft, open }
          return { draft, history: syncEntry(s.history, draft) }
        }),
      setFocus: (focus) =>
        set((s) => {
          const draft = { ...s.draft, focus }
          return { draft, history: syncEntry(s.history, draft) }
        }),
      toggleFolder: (name) =>
        set((s) => ({ openFolders: s.openFolders.includes(name) ? s.openFolders.filter((f) => f !== name) : [...s.openFolders, name] })),
      // Saves the custom fields of the language's dictionary together with the edited word.
      saveWord: (language, fields, entry) =>
        set((s) => {
          const words = s.dictionaries[language]?.words ?? {}
          return { dictionaries: { ...s.dictionaries, [language]: { fields, words: { ...words, [wordKey(entry.word)]: entry } } } }
        }),
      // Adds imported words to the language's dictionary; words that already exist are left untouched.
      importWords: (language, entries, newFields) =>
        set((s) => {
          const dictionary = s.dictionaries[language] ?? { fields: [], words: {} }
          const words = { ...dictionary.words }
          for (const entry of entries) {
            if (!(wordKey(entry.word) in words)) words[wordKey(entry.word)] = entry
          }
          const fields = [...dictionary.fields, ...newFields.filter((f) => !dictionary.fields.some((x) => x.toLowerCase() === f.toLowerCase()))]
          return { dictionaries: { ...s.dictionaries, [language]: { fields, words } } }
        }),
      // Deleting the open translation leaves a new blank one in its place.
      deleteTranslation: (id) =>
        set((s) => ({ history: s.history.filter((h) => h.id !== id), draft: s.draft.id === id ? emptyDraft() : s.draft })),
      // A folder can only be deleted while it is empty.
      deleteFolder: (name) =>
        set((s) =>
          s.history.some((h) => h.folder === name)
            ? s
            : {
                folders: s.folders.filter((f) => f !== name),
                openFolders: s.openFolders.filter((f) => f !== name),
                folderLanguages: Object.fromEntries(Object.entries(s.folderLanguages).filter(([folder]) => folder !== name)),
                folderPublishing: Object.fromEntries(Object.entries(s.folderPublishing).filter(([folder]) => folder !== name)),
              },
        ),
      deleteDictionary: (language) =>
        set((s) => ({ dictionaries: Object.fromEntries(Object.entries(s.dictionaries).filter(([key]) => key !== language)) })),
      deleteWord: (language, word) =>
        set((s) => {
          const dictionary = s.dictionaries[language]
          if (!dictionary) return s
          const words = Object.fromEntries(Object.entries(dictionary.words).filter(([key]) => key !== wordKey(word)))
          return { dictionaries: { ...s.dictionaries, [language]: { ...dictionary, words } } }
        }),
      // A language button can only be removed while no translation uses the language.
      removeLanguage: (name) =>
        set((s) => (s.history.some((h) => sameLanguage(h.language, name)) ? s : { languages: s.languages.filter((l) => !sameLanguage(l, name)) })),
      confirmIntro: () => set((s) => ({ draft: completeStep(s.draft, 'intro') })),
      confirmTitle: (title, publishing, useFolderPublishing) =>
        set((s) => {
          const shared = useFolderPublishing && !!s.draft.folder
          const draft = { ...completeStep(s.draft, 'title'), title, publishing, useFolderPublishing: shared }
          // Shared publishing data is stored on the folder and copied to every translation in it that uses it.
          const folderPublishing = shared ? { ...s.folderPublishing, [draft.folder]: publishing } : s.folderPublishing
          const history = upsertEntry(s.history, draft).map((h) =>
            shared && h.folder === draft.folder && h.useFolderPublishing ? { ...h, publishing } : h,
          )
          return { folderPublishing, draft, history }
        }),
      confirmFolder: (name) =>
        set((s) => {
          // Folder names are compared case-insensitively so "Gita" and "gita" stay one folder.
          const existing = s.folders.find((f) => f.toLowerCase() === name.toLowerCase())
          const folder = existing ?? name
          const base = { ...completeStep(s.draft, 'folder'), folder }
          // A folder with shared languages gives them to the translation and the Languages step is skipped (it stays available).
          const shared = folder ? s.folderLanguages[folder] : undefined
          const withLanguages = shared
            ? completeStep({ ...base, language: shared.language, sourceLanguages: shared.sourceLanguages, useFolderLanguages: true }, 'language')
            : { ...base, useFolderLanguages: false }
          // A folder with shared publishing data gives it to the translation too.
          const sharedPublishing = folder ? s.folderPublishing[folder] : undefined
          const draft = sharedPublishing
            ? { ...withLanguages, publishing: sharedPublishing, useFolderPublishing: true }
            : { ...withLanguages, useFolderPublishing: false }
          return {
            folders: folder && !existing ? [folder, ...s.folders] : s.folders,
            draft,
            history: upsertEntry(s.history, draft),
          }
        }),
      confirmLanguages: (language, sourceLanguages, useFolderLanguages) =>
        set((s) => {
          const shared = useFolderLanguages && !!s.draft.folder
          const draft = { ...completeStep(s.draft, 'language'), language, sourceLanguages, useFolderLanguages: shared }
          // Shared languages are stored on the folder and copied to every translation in it that uses them.
          const folderLanguages = shared ? { ...s.folderLanguages, [draft.folder]: { language, sourceLanguages } } : s.folderLanguages
          const history = upsertEntry(s.history, draft).map((h) =>
            shared && h.folder === draft.folder && h.useFolderLanguages ? { ...h, language, sourceLanguages } : h,
          )
          return { languages: s.languages.includes(language) ? s.languages : [language, ...s.languages], folderLanguages, draft, history }
        }),
      confirmText: (text) =>
        set((s) => {
          // The sentence list is only rebuilt when the text changed, so a list from the AI is not overwritten.
          const rebuilt = !(text === s.draft.text && s.draft.sentences)
          const sentences = rebuilt ? sentencesText(text) : s.draft.sentences
          const base = { ...completeStep(s.draft, 'text'), text, sentences }
          const draft = rebuilt ? resetTranslations(base) : base
          return { history: upsertEntry(s.history, draft), draft }
        }),
      // Data pasted from a Google Sheet replaces the text, the sentence list and the translations.
      confirmSheet: (text, sentences, translations) =>
        set((s) => {
          const draft = { ...resetTranslations({ ...completeStep(s.draft, 'text'), text, sentences }), translations }
          return { draft, history: upsertEntry(s.history, draft) }
        }),
      confirmSentences: () =>
        set((s) => {
          const draft = completeStep(s.draft, 'sentences')
          return { draft, history: syncEntry(s.history, draft) }
        }),
      setTranslation: (n, text) =>
        set((s) => {
          const translations = { ...s.draft.translations, [n]: { ...s.draft.translations[n], text, completed: s.draft.translations[n]?.completed ?? false } }
          const draft = { ...s.draft, translations }
          return { draft, history: syncEntry(s.history, draft) }
        }),
      setCompleted: (n, completed) =>
        set((s) => {
          const translations = { ...s.draft.translations, [n]: { ...s.draft.translations[n], text: s.draft.translations[n]?.text ?? '', completed } }
          const draft = { ...s.draft, translations }
          return { draft, history: syncEntry(s.history, draft) }
        }),
      setComment: (n, comment) =>
        set((s) => {
          const previous = s.draft.translations[n]
          const translations = { ...s.draft.translations, [n]: { text: previous?.text ?? '', completed: previous?.completed ?? false, comment } }
          const draft = { ...s.draft, translations }
          return { draft, history: syncEntry(s.history, draft) }
        }),
      confirmErrors: () =>
        set((s) => {
          const draft = completeStep(s.draft, 'errors')
          return { draft, history: syncEntry(s.history, draft) }
        }),
      confirmTranslate: () =>
        set((s) => {
          const draft = completeStep(s.draft, 'translate')
          return { draft, history: syncEntry(s.history, draft) }
        }),
      newDraft: () => set({ draft: emptyDraft() }),
      openEntry: (e) =>
        set({
          draft: { id: e.id, title: e.title, folder: e.folder, language: e.language, sourceLanguages: e.sourceLanguages, useFolderLanguages: e.useFolderLanguages, publishing: e.publishing, useFolderPublishing: e.useFolderPublishing, text: e.text, sentences: e.sentences, translations: e.translations, done: e.done, open: e.open, focus: e.focus },
        }),
    }),
    {
      name: 'translation-tool',
      version: 11,
      // Version 5 added the sentence list (generated for saved texts), version 6 the translations, version 7 the dictionaries,
      // version 8 the source languages (earlier translations assumed English, so they get it ticked),
      // version 9 the capitalized flag and language of dictionary words,
      // version 10 the shared languages of folders, version 11 the publishing data.
      migrate: (persisted, version) => {
        const old = version < 4 ? fromNumbers(persisted as Legacy, version) : (persisted as Store)
        return {
          ...old,
          dictionaries: withWordDefaults(old.dictionaries ?? {}),
          folderLanguages: old.folderLanguages ?? {},
          folderPublishing: old.folderPublishing ?? {},
          history: old.history.map((h) => ({ ...h, sentences: h.sentences || sentencesText(h.text), translations: h.translations ?? {},
            sourceLanguages: version < 8 ? assumedSources(h.language) : h.sourceLanguages,
            useFolderLanguages: h.useFolderLanguages ?? false,
            publishing: h.publishing ?? emptyPublishing(),
            useFolderPublishing: h.useFolderPublishing ?? false,
          })),
          draft: { ...old.draft, sentences: old.draft.sentences || sentencesText(old.draft.text), translations: old.draft.translations ?? {},
            sourceLanguages: version < 8 ? assumedSources(old.draft.language) : old.draft.sourceLanguages,
            useFolderLanguages: old.draft.useFolderLanguages ?? false,
            publishing: old.draft.publishing ?? emptyPublishing(),
            useFolderPublishing: old.draft.useFolderPublishing ?? false,
          },
        }
      },
    },
  ),
)
