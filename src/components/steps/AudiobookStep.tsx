import { useStore } from '../../store/useStore'
import { useCopy } from '../../lib/useCopy'

const GEMINI_URL = 'https://aistudio.google.com/u/0/generate-speech?model=gemini-2.5-pro-preview-tts&pli=1'

const card = 'rounded-lg border border-(--line) p-4'
const cardHeader = '-mx-4 -mt-4 mb-4 rounded-t-lg border-b border-(--line) bg-(--raised) px-4 py-2 font-medium'

// Voices from Google's list of Gemini TTS voices, with the gender Google gives them.
const VOICES = [
  { name: 'Leda', gender: 'female' },
  { name: 'Charon', gender: 'male' },
  { name: 'Zephyr', gender: 'female' },
]

/** Prompts that tell Gemini TTS how to read the translation; the text gets " in <language>" for the translation's target language. */
const PROMPTS = [
  {
    id: 'narrator',
    title: 'Calm',
    text: (inLanguage: string) =>
      `Read in ${inLanguage}, soothing, calming and relaxed.`,
  },
  {
    id: 'meditative',
    title: 'Meditative',
    text: (inLanguage: string) =>
      `Read in ${inLanguage}, spiritual, youthful, epic, soothing, calming and harmonic.`,
  },
  {
    id: 'persuasive',
    title: 'Persuasive',
    text: (inLanguage: string) =>
      `Read in ${inLanguage}, blockbuster trailer style, emotional, youthful, epic, soothing, calming and relaxed`,
  },
]

export function AudiobookStep() {
  const language = useStore((s) => s.draft.language)
  const { copy, label } = useCopy<string>()
  const inLanguage = language ? ` in ${language}` : ''

  return (
    <div className="space-y-4">
      <section className="space-y-3">
        <p className="max-w-prose">
          In 2026 you can create audiobooks for free in many languages, with AI, which makes your translations available to people who prefer listening to reading.
        </p>
        <ul className="max-w-prose list-disc space-y-2 pl-5 marker:text-(--accent)">
          <li>The quality is often good enough to make it worth listening to.</li>
          <li>The biggest problem is usually consistency. The same words aren't always pronounced the same, and sometimes not all words are said.</li>
          <li>
            Sanskrit pronunciation can be approximated, but it requires a distinction between words that exist both in Sanskrit and in the translated language.
          </li>
          <li>Gemini TTS below is a good place to start: you give it the text and a prompt, and choose a voice.</li>
          <li>Phonemes, for controlling how words are pronounced, may be added to this software later.</li>
        </ul>
      </section>

      <section className={card}>
        <h3 className={cardHeader}>Gemini TTS</h3>
        <div className="space-y-4">
          <a
            href={GEMINI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-(--line) px-4 py-2 text-sm hover:border-(--muted)"
          >
            Open Gemini speech generation in Google AI Studio ↗
          </a>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Prompts</h4>
            {PROMPTS.map((p) => {
              const text = p.text(inLanguage)
              return (
                <div key={p.id} className="space-y-2">
                  <p className="text-sm text-(--muted)">{p.title}</p>
                  <div className="flex items-start gap-2">
                    <p className="max-w-prose flex-1 rounded-md border border-(--line) bg-(--bg) p-3 text-sm leading-relaxed">{text}</p>
                    <button
                      type="button"
                      onClick={() => copy(p.id, text)}
                      className="shrink-0 rounded-md border border-(--line) px-4 py-2 text-sm hover:border-(--muted)"
                    >
                      {label(p.id, 'Copy prompt')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>


          <ul className="max-w-prose list-disc space-y-2 pl-5 marker:text-(--accent)">
            <li>Gemini TTS create natural and high quality voices, a few ones per day for free in 2026.</li>
            <li>You can describe the style, accent, pace and tone in plain language in the prompt, and Gemini follows it. However, not all descriptions produce what you expect, so you need to experiment to get a good prompt.</li>
            <li>It supports many languages. For English it's recommended that you instruct what accent to use (in the prompt).</li>
            <li>Each voice has its own character, so listen to a few before choosing one.</li>
            <li>Sanskrit pronunciation is normally inconsistent (you can use Devanagari). Some words (in any language) are sometimes skipped or replacd.</li>
            <li>If you're having trouble creating and downloading audio, ask AI for help.</li>
          </ul>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Suggested voices</h4>
            <ul className="flex flex-wrap gap-2">
              {VOICES.map((voice) => (
                <li key={voice.name} className="rounded-full border border-(--line) px-3 py-1 text-sm">
                  {voice.name} <span className="text-(--muted)">{voice.gender}</span>
                </li>
              ))}
            </ul>
            <p className="max-w-prose text-sm text-(--muted)">Listen to the samples in AI Studio and pick the voice you like best.</p>
          </div>
        </div>
      </section>

      <section className={`${card} border-dashed`}>
        <h3 className={cardHeader}>Phoneme Precision</h3>
        <p className="max-w-prose pb-5">
          Phonemes control how words are pronounced. In 2026 the consistency of AI voices using phonemes is better than Gemini TTS, but the output is still not always as expected.
        </p>
        <p className="max-w-prose pb-5">
          To create better Sanskrit in 2026 (this has been done and tested in practice, and may be added later to this software):
        </p>
        <ul className="max-w-prose list-disc space-y-2 pl-5 marker:text-(--accent)">
          <li>Find a TTS voice that supports phonemes (may or may not exist in your desired language).</li>
          <li>Google TTS has high quality American voices with free tiers which reset every month.</li>
          <li>Amazon Polly has a bilingual voice (English and Hindi) which has quite good Sanskrit pronunciation, but is a bit difficult to understand in English.</li>
          <li>Create a translation system that converts (for example Shrii Shrii Ánandamúrti's Roman Sanskrit) characters and pronunciation rules into phonetic characters (IPA or X-SAMPA).</li>
        </ul>
      </section>
    </div>
  )
}
