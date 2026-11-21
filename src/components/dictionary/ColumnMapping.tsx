import { groupOf, type Target } from '../../features/dictionary/import'
import { fieldClass } from './styles'

interface Props {
  /** The rows shown under the selects (data rows only). */
  preview: string[][]
  totalRows: number
  header: string[] | null
  columns: number
  mapping: Target[]
  fields: string[]
  language: string
  onChange: (column: number, target: Target) => void
}

/** The pasted data with a select above each column for choosing which dictionary column it goes into. */
export function ColumnMapping({ preview, totalRows, header, columns, mapping, fields, language, onChange }: Props) {
  // Offers translation groups up to what the columns (or an already mapped group number) need.
  const groups = Math.max(1, Math.ceil((columns - 1) / 3), ...mapping.map(groupOf))
  const numbers = Array.from({ length: groups }, (_, i) => i + 1)
  // A column is named after its header cell, or by its position when there is no header row.
  const columnName = (i: number) => (header?.[i] ?? '').trim() || `Column ${i + 1}`

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-md border border-(--line)">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              {Array.from({ length: columns }, (_, i) => (
                <th key={i} className="min-w-48 border-b border-(--line) bg-(--raised) p-2 text-left font-normal align-bottom">
                  <select
                    value={mapping[i]}
                    onChange={(e) => onChange(i, e.target.value)}
                    aria-label={`Where column ${i + 1} goes`}
                    className={`${fieldClass} py-1.5`}
                  >
                    <option value="ignore">Ignore this column</option>
                    <option value="word">Word</option>
                    <option value="language">Language</option>
                    <optgroup label="Translations">
                      {numbers.flatMap((n) => [
                        <option key={`t${n}`} value={`translation:${n}`}>{`Translation ${n}`}</option>,
                        <option key={`o${n}`} value={`original:${n}`}>{`Example (original) ${n}`}</option>,
                        <option key={`e${n}`} value={`translated:${n}`}>{`Example (${language}) ${n}`}</option>,
                      ])}
                    </optgroup>
                    <optgroup label="Custom fields">
                      {/* Creates a custom field named after the column; not offered when a field of that name exists already. */}
                      {!fields.some((f) => f.toLowerCase() === columnName(i).toLowerCase()) && (
                        <option value="newField">{`Custom field: ${columnName(i)}`}</option>
                      )}
                      {fields.map((f) => (
                        <option key={f} value={`field:${f}`}>{`Custom field: ${f}`}</option>
                      ))}
                    </optgroup>
                  </select>
                </th>
              ))}
            </tr>
            {header && (
              <tr>
                {Array.from({ length: columns }, (_, i) => (
                  <th key={i} className="border-b border-(--line) px-2 py-1 text-left font-medium text-(--muted)">
                    {header[i]}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {preview.map((row, r) => (
              <tr key={r} className="border-b border-(--line) last:border-b-0">
                {Array.from({ length: columns }, (_, i) => (
                  <td key={i} className="max-w-56 truncate px-2 py-1" title={row[i]}>
                    {row[i]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-(--muted)">
        Showing the first {preview.length} of {totalRows} rows.
      </p>
    </div>
  )
}
