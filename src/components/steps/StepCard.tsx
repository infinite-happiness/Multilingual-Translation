import type { ReactNode } from 'react'

interface Props {
  n: number
  title: string
  status: 'done' | 'active' | 'locked' | 'unbuilt'
  open: boolean
  summary?: string
  onToggle: () => void
  children?: ReactNode
}

/** Collapsible wrapper shared by every step; collapsed cards form a compact vertical list. */
export function StepCard({ n, title, status, open, summary, onToggle, children }: Props) {
  const locked = status === 'locked' || status === 'unbuilt'
  return (
    <section data-step-open={open && !locked ? '' : undefined} className="rounded-lg border border-(--line) bg-(--surface)">
      <button
        type="button"
        onClick={onToggle}
        disabled={locked}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-(--accent) disabled:cursor-default"
      >
        <span
          className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${
            status === 'done'
              ? 'bg-(--accent) text-(--accent-ink)'
              : status === 'active'
                ? 'border border-(--accent) text-(--accent)'
                : 'border border-(--line) text-(--muted)'
          }`}
        >
          {status === 'done' ? '✓' : n}
        </span>
        <span className={`font-medium ${locked ? 'text-(--muted)' : ''}`}>{title}</span>
        {!open && summary && <span className="ml-2 min-w-0 flex-1 truncate text-sm text-(--muted)">{summary}</span>}
        {locked && <span className="ml-auto text-xs text-(--muted)">{status === 'unbuilt' ? 'Not built yet' : 'Finish the earlier steps first'}</span>}
        {!locked && (
          <span className={`ml-auto text-(--muted) transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden>
            ›
          </span>
        )}
      </button>
      {open && !locked && <div className="border-t border-(--line) px-4 py-4">{children}</div>}
    </section>
  )
}
