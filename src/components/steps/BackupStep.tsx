import { useStore } from '../../store/useStore'
import { BackupPanel } from '../backup/BackupPanel'
import { SheetCopyButtons } from '../sheets/SheetCopyButtons'
import { DictionaryCopyButton } from '../sheets/DictionaryCopyButton'

export function BackupStep() {
  const language = useStore((s) => s.draft.language)

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="font-medium">Back up this translation to a Google Sheet</h3>
        <p className="max-w-prose text-sm leading-relaxed text-(--muted)">
          Everything you make here is stored only in this browser, so back up all your data to a tab in your own Google Sheet. Do this for every
          translation:
        </p>
        <ol className="max-w-prose list-decimal space-y-1 pl-5 text-sm leading-relaxed text-(--muted) marker:text-(--accent)">
          <li>Create a new tab in your Google Sheet for this translation.</li>
          <li>Press one of the buttons below, click cell A1 in the tab and paste (Ctrl+V, or Cmd+V on a Mac).</li>
        </ol>
        <ul className="max-w-prose list-disc space-y-1 pl-5 text-sm leading-relaxed text-(--muted) marker:text-(--muted)">
          <li>Copy original: the sentences in one column.</li>
          <li>Copy translation: the translations in one column, row for row with the original.</li>
          <li>Copy all: the original, the translation, your comment and the word "completed" for finished sentences, in four columns. Use this one for a full backup.</li>
        </ul>
        <p className="max-w-prose text-sm leading-relaxed text-(--muted)">An empty row marks the end of each paragraph.</p>
        <SheetCopyButtons />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">Back up the dictionary to a Google Sheet</h3>
        <p className="max-w-prose text-sm leading-relaxed text-(--muted)">
          {language
            ? `Do the same for the ${language} dictionary: create a tab of your own for it, for example "${language} dictionary", press the button, click cell A1 in that tab and paste. `
            : 'Choose a target language first, then the dictionary of that language can be copied. '}
          The first row holds the column names, and every following row is one word with its translations, their examples and its custom fields.
        </p>
        <DictionaryCopyButton language={language} />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">Back up everything as a file</h3>
        <BackupPanel />
      </section>
    </div>
  )
}
