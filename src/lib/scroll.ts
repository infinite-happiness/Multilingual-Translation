/** Scrolls an element into view, without animation when the system asks to reduce motion. */
export function scrollIntoView(el: Element, block: ScrollLogicalPosition) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block })
}
