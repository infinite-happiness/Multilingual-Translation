import { useStore } from '../../store/useStore'

export function IntroStep() {
  const confirmIntro = useStore((s) => s.confirmIntro)

  return (
    <div className="space-y-4">
      <p className="max-w-prose text-(--muted)">The translation is made in three passes, each one building on the last.</p>
      <ol className="max-w-prose list-decimal space-y-3 pl-5 marker:text-(--accent)">
        <li>
          <span className="font-medium">Make sure every sentence is included.</span> The text is split into one sentence per line, with an empty
          line after each paragraph. You check this list against the original before anything is translated, so nothing is skipped or merged.
        </li>
        <li>
          <span className="font-medium">Get a rough AI translation of each sentence.</span> The AI translates the whole list in the same format,
          using your earlier translations as a style guide. This draft only needs to be complete, not perfect.
        </li>
        <li>
          <span className="font-medium">Work through one sentence at a time.</span> Each sentence is reviewed on its own, with alternatives for
          ambiguous terms. Finally the whole translation is checked for spelling, formatting and grammar errors.
        </li>
      </ol>
      <button type="button" onClick={confirmIntro} className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink)">
        Continue
      </button>
    </div>
  )
}
