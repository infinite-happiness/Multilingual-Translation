import { useStore } from '../../store/useStore'
import { errorCheckPrompt, numberedTranslations } from '../../features/translation/prompts'
import { useCopy } from '../../lib/useCopy'
import { focusOpenStep } from '../../lib/scroll'

export function ErrorCheckStep() {
  const { draft, confirmErrors } = useStore()
  const { copy, label } = useCopy<'prompt'>()
  const lines = numberedTranslations(draft.translations)

  const done = () => {
    confirmErrors()
    focusOpenStep()
  }

  return (
    <div className="space-y-4">
      <p className="max-w-prose text-sm leading-relaxed text-(--muted)">
        Copy the prompt together with your translation and give it to an AI. The sentences keep their numbers, and the AI only lists the sentences
        that have errors.
      </p>
      <p className="text-sm text-(--muted)">
        {lines.length} translated {lines.length === 1 ? 'sentence' : 'sentences'} will be included.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={lines.length === 0}
          onClick={() => copy('prompt', errorCheckPrompt(draft.language, lines))}
          className="rounded-md border border-(--line) px-4 py-2 text-sm hover:border-(--muted) disabled:opacity-40"
        >
          {label('prompt', 'Copy prompt with translation')}
        </button>
        <button type="button" onClick={done} className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink)">
          Done
        </button>
      </div>
    </div>
  )
}
