import { displayWord, type DictWord } from '../../features/dictionary/types'
import { TrashIcon } from '../TrashIcon'

interface Props {
  entry: DictWord
  /** Names of the dictionary's custom fields. */
  fields: string[]
  language: string
  /** Opens the dialog for editing this entry. */
  onOpen: () => void
  /** Asks to delete this word from the dictionary. */
  onDelete: () => void
}

/** Read-only view of a dictionary entry: translations in priority order with their examples, then the custom fields. */
export function WordCard({ entry, fields, language, onOpen, onDelete }: Props) {
  return (
    // The whole card opens the dialog. The word is a real button inside it, so keyboard users can reach it too
    // (its click bubbles up to the card). A click that ends a text selection is ignored so text can still be copied.
    <article
      onClick={() => !window.getSelection()?.toString() && onOpen()}
      className="group relative cursor-pointer space-y-3 rounded-lg border border-(--line) bg-(--surface) p-4 hover:border-(--muted)"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        aria-label={`Delete ${displayWord(entry)}`}
        className="absolute top-3 right-3 grid size-8 place-items-center rounded-md text-(--muted) opacity-0 group-hover:opacity-100 hover:bg-(--raised) hover:text-(--tone-red) focus-visible:opacity-100 pointer-coarse:opacity-100"
      >
        <TrashIcon />
      </button>
      <div className="flex flex-wrap items-center gap-2 pr-10">
        <h2 className="text-lg font-medium">
          <button
            type="button"
            className="break-words rounded-sm text-left group-hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-(--accent)"
          >
            {displayWord(entry)}
          </button>
        </h2>
        {entry.language && (
          <span className="rounded-full border border-(--line) px-2 py-0.5 text-xs text-(--muted)">{entry.language}</span>
        )}
      </div>

      {entry.translations.length === 0 ? (
        <p className="text-sm text-(--muted)">No translations yet.</p>
      ) : (
        <ol className="space-y-2">
          {entry.translations.map((t, i) => (
            <li key={t.id} className="flex gap-3 rounded-md bg-(--raised) p-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-(--bg) text-xs font-medium tabular-nums text-(--accent)">
                {i + 1}
              </span>
              <div className="min-w-0 space-y-1">
                <p className="break-words font-medium">{t.text}</p>
                {t.exampleOriginal && (
                  <p className="break-words text-sm">
                    <span className="text-(--muted)">Original · </span>
                    {t.exampleOriginal}
                  </p>
                )}
                {t.exampleTranslated && (
                  <p className="break-words text-sm">
                    <span className="text-(--muted)">{language} · </span>
                    {t.exampleTranslated}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {fields.length > 0 && (
        <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[max-content_1fr]">
          {fields.map((name) => (
            <div key={name} className="contents">
              <dt className="text-(--muted)">{name}</dt>
              <dd className="break-words">{entry.custom[name] || <span className="text-(--muted)">–</span>}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  )
}
