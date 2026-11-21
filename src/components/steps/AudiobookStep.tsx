/** Placeholder for the audiobook step; the two parts below are planned but not built yet. */
export function AudiobookStep() {
  const parts = [
    { title: 'Gemini', text: 'Generate the audio of the translation with Gemini.' },
    { title: 'Phonemes', text: 'Phonemes for controlling how words are pronounced.' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {parts.map((part) => (
        <section key={part.title} className="space-y-1 rounded-lg border border-dashed border-(--line) p-4">
          <h3 className="font-medium">{part.title}</h3>
          <p className="text-sm text-(--muted)">{part.text}</p>
          <p className="text-sm text-(--muted)">Not built yet.</p>
        </section>
      ))}
    </div>
  )
}
