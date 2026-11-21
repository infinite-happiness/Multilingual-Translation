import { useStore } from '../../store/useStore'

export function IntroStep() {
  const confirmIntro = useStore((s) => s.confirmIntro)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-(--muted)">
        <p>Namaskar 🙏</p>
        <p>v{__BUILD_DATE__} alpha</p>
      </div>
      <h2 className="text-2xl font-semibold">AI Optimized Multi-Lingual Translation</h2>
      <p>AI can certainly be used for translation, but at the same time there are some pitfalls to avoid, in order to make the translations high quality,</p>

      <section className="rounded-lg border border-(--line) p-4">
        <h3 className="-mx-4 -mt-4 mb-4 rounded-t-lg border-b border-(--line) bg-(--raised) px-4 py-2 font-medium">Pitfalls</h3>
        <p className="mb-3 max-w-prose">If you translate a whole chapter or discourse at once with AI in 2026, these problems are likely to occur:</p>
        <ul className="max-w-prose list-disc space-y-2 pl-5 marker:text-(--accent)">
          <li>
            the same word may not be translated the same way throughout the chapter/discourse, and even if it is, it may not be translated the same
            way in the next chapter/discourse
          </li>
          <li>
            when translating a word it's not only about finding the right word, but may also include grammatical rules, for example if a Sanskrit
            word needs a gender (or den/det in Swedish) in the translated language, AI may not be consistent about the gender
          </li>
          <li>in a bad case AI may even forget sentences, leaving them out completely</li>
        </ul>
      </section>

      <section className="rounded-lg border border-(--line) p-4">
        <h3 className="-mx-4 -mt-4 mb-4 rounded-t-lg border-b border-(--line) bg-(--raised) px-4 py-2 font-medium">Sentence by sentence</h3>
        <p className="max-w-prose">
          For high quality translation, the solution is to translate sentence by sentence. This way you ask AI to help you with each sentence
          individually, providing multiple options for difficult terms (which the software helps you with).
        </p>
      </section>

      <section className="rounded-lg border border-(--line) p-4">
        <h3 className="-mx-4 -mt-4 mb-4 rounded-t-lg border-b border-(--line) bg-(--raised) px-4 py-2 font-medium">Dictionary</h3>
        <p className="max-w-prose">
          Furthermore, the software helps you create a dictionary, so that you can keep track of how words are translated throughout multiple
          discourses/books (including grammatical rules).
        </p>
      </section>

      <section className="rounded-lg border border-(--line) p-4">
        <h3 className="-mx-4 -mt-4 mb-4 rounded-t-lg border-b border-(--line) bg-(--raised) px-4 py-2 font-medium">Glossary</h3>
        <p className="max-w-prose">
          The software even creates a glossary of the Sanskrit words added to the dictionary, which can be added to discourses or Baba's books.
        </p>
      </section>

      <section className="rounded-lg border border-(--line) p-4">
        <h3 className="-mx-4 -mt-4 mb-4 rounded-t-lg border-b border-(--line) bg-(--raised) px-4 py-2 font-medium">Backups</h3>
        <p className="max-w-prose">The software also helps with backups, since one should always keep multiple backups of important work.</p>
      </section>

      <button type="button" onClick={confirmIntro} className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink)">
        Continue
      </button>
    </div>
  )
}

/*

Namaskar!
Since I started translating Baba's books into Swedish with Didi Ananda Samprajina, I've worked out an optimized method for maximum utilization of AI, translating into other languages as well.
I hope this will inspire more people to translate Baba's book into new languages.

AI can certainly be used for translation, but at the same time there are some pitfalls to avoid, in order to make the translations high quality,
  PitfallsIf you translate a whole chapter or discourse at once with AI in 2026, these problems are likely to occur: - the same word may not be translated the same way throughout the chapter / discourse, and even if it is, it may not be translated the same way in the next chapter / discourse - when translating a word it's not only about finding the right word, but may also include grammatical rules, for example if a Sanskrit word needs a gender (or den/det in Swedish) in the translated language, AI may not be consistent about the gender- in a bad case AI may even forget sentences, leaving them out completely
Sentence by sentenceFor high quality translation, the solution is to translate sentence by sentence.This way you ask AI to help you with each sentence individually, providing multiple options for difficult terms(which the software helps you with).
  DictionaryFurthermore, the software helps you create a dictionary, so that you can keep track of how words are translated throughout multiple discourses / books(including grammatical rules).
GlossaryThe software even creates a glossary of the Sanskrit words added to the dictionary, which can be added to discourses or Baba's books.
BackupsThe software also helps with backups, since one should always keep multiple backups of important work.
AudiobooksAudiobooks can be made for free in 2026, but the biggest problem is always Sanskrit pronunciation.Still, it's a way to make the translations available to people who won't read text.Sanskrit pronunciation can be approximated, but it requires a distinction between words that exist both in Sanskrit and the translated language.This feature may be added to the software later.
The software is hosted for free on github(so that it doesn't need anyone to pay for a server to keep working):https://infinite-happiness.github.io/Multilingual-Translation

*/