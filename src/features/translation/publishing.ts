import { sheetCell } from './sheet'

/** Optional publishing data of a translation; every field may stay empty. */
export interface Publishing {
  publisher: string
  originalTitle: string
  originalYear: string
  originalPublisher: string
  translatedBy: string
}

export const PUBLISHING_FIELDS: { key: keyof Publishing; label: string }[] = [
  { key: 'publisher', label: 'Publisher' },
  { key: 'originalTitle', label: 'Original title' },
  { key: 'originalYear', label: 'Original year' },
  { key: 'originalPublisher', label: 'Original publisher' },
  { key: 'translatedBy', label: 'Translated by' },
]

export const emptyPublishing = (): Publishing => ({ publisher: '', originalTitle: '', originalYear: '', originalPublisher: '', translatedBy: '' })

/** The fields that have a value, with their labels. */
export const filledFields = (publishing: Publishing) =>
  PUBLISHING_FIELDS.filter((field) => publishing[field.key].trim()).map((field) => ({ label: field.label, value: publishing[field.key].trim() }))

/** Free text, one line per filled field: "Publisher: Name". */
export const publishingText = (publishing: Publishing): string =>
  filledFields(publishing)
    .map((f) => `${f.label}: ${f.value}`)
    .join('\n')

/** One row per filled field for a Google Sheet: the label, then the value. */
export const publishingSheet = (publishing: Publishing): string =>
  filledFields(publishing)
    .map((f) => [f.label, f.value].map(sheetCell).join('\t'))
    .join('\n')
