import { useStore } from '../../store/useStore'
import { filledFields, publishingSheet, publishingText } from '../../features/translation/publishing'
import { useCopy } from '../../lib/useCopy'

/** The publishing data of the translation, with buttons for copying it as free text or for a Google Sheet. */
export function PublishingData() {
  const publishing = useStore((s) => s.draft.publishing)
  const { copy, label } = useCopy<'text' | 'sheet'>()
  const fields = filledFields(publishing)
  const button = 'rounded-md border border-(--line) px-4 py-2 text-sm hover:border-(--muted) disabled:opacity-40'

  return (
    <section className="space-y-3 border-t border-(--line) pt-6">
      <h3 className="text-lg font-medium">Publishing data</h3>
      {fields.length === 0 ? (
        <p className="text-sm text-(--muted)">No publishing data was entered. It can be added in the Title step.</p>
      ) : (
        <dl className="grid max-w-prose gap-x-4 gap-y-1 sm:grid-cols-[max-content_1fr]">
          {fields.map((f) => (
            <div key={f.label} className="contents">
              <dt className="text-(--muted)">{f.label}</dt>
              <dd className="break-words">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={fields.length === 0} onClick={() => copy('text', publishingText(publishing))} className={button}>
          {label('text', 'Copy text')}
        </button>
        <button type="button" disabled={fields.length === 0} onClick={() => copy('sheet', publishingSheet(publishing))} className={button}>
          {label('sheet', 'Copy to Google Sheet')}
        </button>
      </div>
    </section>
  )
}
