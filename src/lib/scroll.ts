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
