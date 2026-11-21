import { useStore } from '../../store/useStore'
import { parseSentences } from '../../features/translation/sentences'
import { finalParagraphs } from '../../features/translation/finalText'
import { glossaryFor } from '../../features/translation/glossary'
import { GlossarySet } from './Glossary'
import { PublishingData } from './PublishingData'
import { sameLanguage } from '../../features/translation/languages'
import { useCopy } from '../../lib/useCopy'

export function FinalTextStep() {
  const draft = useStore((s) => s.draft)
  const dictionary = useStore((s) => s.dictionaries[draft.language])
  const history = useStore((s) => s.history)
  const { copy, label } = useCopy<'text'>()

  const sentences = parseSentences(draft.sentences)

  // The folder glossary covers the translations in the same folder with the same target language (this one included).
  const folderEntries = draft.folder ? history.filter((h) => h.folder === draft.folder && sameLanguage(h.language, draft.language)) : []
  const folderParagraphs = folderEntries.flatMap((h) => parseSentences(h.sentences))
  const folderSources = [...draft.sourceLanguages]
  for (const source of folderEntries.flatMap((h) => h.sourceLanguages)) {
    if (!folderSources.some((s) => sameLanguage(s.name, source.name))) folderSources.push(source)
  }
  const paragraphs = finalParagraphs(sentences, draft.translations)
  const total = sentences.reduce((sum, paragraph) => sum + paragraph.length, 0)
  const translated = Object.values(draft.translations).filter((t) => t.text.trim()).length
  const missing = Math.max(0, total - translated)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={paragraphs.length === 0}
          onClick={() => copy('text', paragraphs.join('\n\n'))}
          className="rounded-md border border-(--line) px-4 py-2 text-sm hover:border-(--muted) disabled:opacity-40"
        >
          {label('text', 'Copy text')}
        </button>
        {missing > 0 && (
          <span className="text-sm text-(--muted)">
            {missing} {missing === 1 ? 'sentence has' : 'sentences have'} no translation yet and {missing === 1 ? 'is' : 'are'} left out.
          </span>
        )}
      </div>

      {paragraphs.length === 0 ? (
        <p className="text-(--muted)">The translation will appear here as soon as sentences are translated.</p>
      ) : (
        <div className="max-w-prose space-y-4 leading-relaxed">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="break-words">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <PublishingData />

      {draft.sourceLanguages.length > 0 && (
        <section className="space-y-8 border-t border-(--line) pt-6">
          <h3 className="text-lg font-medium">Glossary</h3>
          <GlossarySet title="This translation" sources={draft.sourceLanguages} paragraphs={sentences} dictionary={dictionary} />
          {draft.folder && (
            <GlossarySet title={`The whole folder: ${draft.folder}`} sources={folderSources} paragraphs={folderParagraphs} dictionary={dictionary} />
          )}
        </section>
      )}
    </div>
  )
}
