export interface Piece {
  text: string
  /** True for the clickable word itself, false for the spaces and punctuation around it. */
  word: boolean
}

// Letters, digits and combining marks (needed for Devanagari vowel signs) belong to a word.
const EDGES = /^([^\p{L}\p{N}\p{M}]*)(.*?)([^\p{L}\p{N}\p{M}]*)$/u

/** Splits a sentence into words and the spaces and punctuation between them; joining the pieces gives the sentence back. */
export function splitWords(sentence: string): Piece[] {
  const pieces: Piece[] = []
  for (const token of sentence.split(/(\s+)/)) {
    const [, before, core, after] = token.match(EDGES) ?? []
    if (!core) {
      if (token) pieces.push({ text: token, word: false })
      continue
    }
    if (before) pieces.push({ text: before, word: false })
    pieces.push({ text: core, word: true })
    if (after) pieces.push({ text: after, word: false })
  }
  return pieces
}
