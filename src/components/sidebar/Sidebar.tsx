import { useState } from 'react'
import { BackupDialog } from './BackupDialog'
import { ImportBackupDialog } from './ImportBackupDialog'
import { ConfirmDialog } from '../ConfirmDialog'
import { TrashIcon } from '../TrashIcon'
import { languagesSummary, usedLanguages } from '../../features/translation/languages'
import { useStore, type HistoryEntry } from '../../store/useStore'

interface Props {
  /** Language of the dictionary shown in the main area, if one is open. */
  dictionary: string | null
  onOpenDictionary: (language: string) => void
  /** Called when a translation is opened, so the main area leaves the dictionary view. */
  onLeaveDictionary: () => void
}

export function Sidebar({ dictionary, onOpenDictionary, onLeaveDictionary }: Props) {
  const { languages, dictionaries, history, folders, openFolders, draft, theme, setTheme, newDraft, openEntry, toggleFolder, deleteTranslation, deleteFolder } = useStore()

  const [backupOpen, setBackupOpen] = useState(false)
  const [importBackupOpen, setImportBackupOpen] = useState(false)
  const [pending, setPending] = useState<{ kind: 'translation'; entry: HistoryEntry } | { kind: 'folder'; name: string } | null>(null)
  // Every language with a button in the language step gets a dictionary, and so does every language that has dictionary data.
  const dictionaryLanguages = [...new Set([...usedLanguages(languages, history), ...Object.keys(dictionaries)])]
  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  const startNew = () => {
    newDraft()
    onLeaveDictionary()
  }

  // Small buttons at the right of a row: shown when hovering or focusing the row, and always on touch screens.
  const rowButton = 'absolute top-1.5 grid size-7 place-items-center rounded-md text-(--muted) opacity-0 group-hover:opacity-100 hover:bg-(--line) focus-visible:opacity-100 pointer-coarse:opacity-100'
  const trashButton = (label: string, onClick: () => void) => (
    <button type="button" onClick={onClick} aria-label={label} className={`${rowButton} right-1 hover:text-(--tone-red)`}>
      <TrashIcon />
    </button>
  )

  // What the delete dialog says and does for the translation or folder that is pending.
  const folderCount = pending?.kind === 'folder' ? history.filter((h) => h.folder === pending.name).length : 0
  const dialog = !pending
    ? null
    : pending.kind === 'translation'
      ? {
          title: `Delete “${pending.entry.title || pending.entry.language}”?`,
          body: 'This deletes its text, sentence list, translations and comments. Dictionaries are not affected. If you may need it again, back it up first in the Backup step.',
          confirmLabel: 'Delete translation',
          onConfirm: () => deleteTranslation(pending.entry.id),
        }
      : folderCount > 0
        ? {
            title: 'This folder is not empty',
            body: `The folder “${pending.name}” still contains ${folderCount} ${folderCount === 1 ? 'translation' : 'translations'}. Delete them, or move them to another folder with their Folder step, and then the folder can be deleted.`,
          }
        : { title: `Delete the folder “${pending.name}”?`, body: 'The folder is empty. Only the folder is deleted.', confirmLabel: 'Delete folder', onConfirm: () => deleteFolder(pending.name) }

  // The languages are left out of a translation's row when its folder shows them for all translations.
  const entry = (h: HistoryEntry, showLanguages = true) => (
    <li key={h.id} className="group relative">
      <button
        type="button"
        onClick={() => {
          openEntry(h)
          onLeaveDictionary()
        }}
        className={`w-full rounded-md py-1.5 pr-8 pl-2 text-left text-sm hover:bg-(--raised) ${h.id === draft.id ? 'bg-(--raised)' : ''}`}
      >
        <span className="block break-words font-medium">{h.title || h.language}</span>
        {showLanguages && h.title && h.language && (
          <span className="block break-words text-xs text-(--muted)">{languagesSummary(h.language, h.sourceLanguages)}</span>
        )}
        <span className="block truncate text-(--muted)">{h.text}</span>
      </button>
      {trashButton(`Delete ${h.title || h.language}`, () => setPending({ kind: 'translation', entry: h }))}
    </li>
  )

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 border-b border-(--line) bg-(--surface) p-4 md:h-full md:w-64 md:border-r md:border-b-0">
      <button type="button" onClick={startNew} className="rounded-md bg-(--accent) px-3 py-2 text-sm font-medium text-(--accent-ink)">
        New translation
      </button>

      <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Translations">
        <h2 className="mb-2 text-sm font-medium text-(--muted)">Translations</h2>
        {history.length === 0 && folders.length === 0 && <p className="text-sm text-(--muted)">Translations you name will appear here.</p>}
        <ul className="space-y-1">
          {folders.map((f) => {
            const open = openFolders.includes(f)
            const inFolder = history.filter((h) => h.folder === f)
            // When every translation in the folder that has languages has the same ones, they are shown under the folder name.
            const summaries = [...new Set(inFolder.filter((h) => h.language).map((h) => languagesSummary(h.language, h.sourceLanguages)))]
            const folderSummary = summaries.length === 1 ? summaries[0] : ''
            return (
              <li key={f}>
                <div className="group relative">
                <button
                  type="button"
                  onClick={() => toggleFolder(f)}
                  aria-expanded={open}
                  className={`flex w-full items-center gap-2 rounded-md border bg-(--bg) py-1.5 pr-8 pl-2 text-left text-sm font-medium hover:border-(--muted) ${
                    open ? 'border-(--accent)' : 'border-(--line)'
                  }`}
                >
                  <span className={`text-(--muted) transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden>›</span>
                  <svg viewBox="0 0 24 24" className={`size-4 shrink-0 ${open ? 'text-(--accent)' : 'text-(--muted)'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {open ? (
                      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
                    ) : (
                      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    )}
                  </svg>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words">{f}</span>
                    {folderSummary && <span className="block break-words text-xs font-normal text-(--muted)">{folderSummary}</span>}
                  </span>
                </button>
                {trashButton(`Delete the folder ${f}`, () => setPending({ kind: 'folder', name: f }))}
                </div>
                {open && (
                  <ul className="ml-3 space-y-1 border-l border-(--line) pl-1">
                    {inFolder.length === 0 ? <li className="px-2 py-1 text-sm text-(--muted)">No translations</li> : inFolder.map((h) => entry(h, !folderSummary))}
                  </ul>
                )}
              </li>
            )
          })}
          {history.filter((h) => !h.folder).map((h) => entry(h))}
        </ul>
      </nav>

      <section aria-label="Dictionaries" className="border-t border-(--line) pt-3">
        <h2 className="mb-2 text-sm font-medium text-(--muted)">Dictionaries</h2>
        {dictionaryLanguages.length === 0 ? (
          <p className="text-sm text-(--muted)">A dictionary is created for every language you use.</p>
        ) : (
          <ul className="max-h-32 space-y-1 overflow-y-auto">
            {dictionaryLanguages.map((language) => (
              <li key={language}>
                <button
                  type="button"
                  onClick={() => onOpenDictionary(language)}
                  aria-current={dictionary === language ? 'true' : undefined}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-(--raised) ${dictionary === language ? 'bg-(--raised)' : ''}`}
                >
                <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-(--muted)" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                </svg>
                <span className="min-w-0 flex-1 truncate">{language}</span>
                <span className="text-(--muted)">{Object.keys(dictionaries[language]?.words ?? {}).length}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="border-t border-(--line) pt-3">
        <h2 className="mb-2 text-sm font-medium text-(--muted)">Tools</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={themeLabel}
            title={themeLabel}
            className="grid size-9 place-items-center rounded-md border border-(--line) text-(--muted) hover:text-(--text)"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {theme === 'dark' ? (
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </>
              ) : (
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              )}
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setBackupOpen(true)}
            aria-label="Back up your translations"
            title="Back up your translations"
            className="grid size-9 place-items-center rounded-md border border-(--line) text-(--muted) hover:text-(--text)"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <path d="M17 21v-8H7v8M7 3v5h8" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setImportBackupOpen(true)}
            aria-label="Import a backup file"
            title="Import a backup file"
            className="grid size-9 place-items-center rounded-md border border-(--line) text-(--muted) hover:text-(--text)"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      <BackupDialog open={backupOpen} onClose={() => setBackupOpen(false)} />
      <ImportBackupDialog open={importBackupOpen} onClose={() => setImportBackupOpen(false)} />
      <ConfirmDialog
        open={!!dialog}
        title={dialog?.title ?? ''}
        confirmLabel={dialog?.confirmLabel}
        onConfirm={() => {
          dialog?.onConfirm?.()
          setPending(null)
        }}
        onClose={() => setPending(null)}
      >
        <p>{dialog?.body}</p>
      </ConfirmDialog>
    </aside>
  )
}
