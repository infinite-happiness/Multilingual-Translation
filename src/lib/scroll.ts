/** Scrolls an element into view, without animation when the system asks to reduce motion. */
export function scrollIntoView(el: Element, block: ScrollLogicalPosition) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block })
}

/** Focuses the translation field of a sentence and scrolls it to the middle of the view. Does nothing when the field is not shown. */
export function focusTranslation(n: number) {
  const field = document.getElementById(`translation-${n}`)
  if (!field) return
  field.focus({ preventScroll: true })
  scrollIntoView(field, 'center')
}

/**
 * Call right after a step was completed: once the step that opened next has rendered, scrolls it to the top of
 * the view and focuses its first text field, with the cursor at the end of any text in it.
 */
export function focusOpenStep() {
  requestAnimationFrame(() => {
    const card = document.querySelector<HTMLElement>('[data-step-open]')
    if (!card) return
    const field = card.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      'input:not([type=checkbox], [type=radio], [type=hidden], [disabled]), textarea:not([disabled], [readonly])',
    )
    // Focus first and scroll last: placing the cursor can scroll the page to reveal the field, and the top of the card has to win.
    if (field) {
      field.focus({ preventScroll: true })
      field.setSelectionRange(field.value.length, field.value.length)
    }
    scrollIntoView(card, 'start')
  })
}
