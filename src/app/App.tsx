import { useEffect, useState, type ReactNode } from 'react'
import { useStore } from '../store/useStore'
import { STEPS, type StepKey } from '../features/translation/steps'
import { Sidebar } from '../components/sidebar/Sidebar'
import { DictionaryView } from '../components/dictionary/DictionaryView'
import { StepCard } from '../components/steps/StepCard'
import { IntroStep } from '../components/steps/IntroStep'
import { TitleStep } from '../components/steps/TitleStep'
import { FolderStep } from '../components/steps/FolderStep'
import { LanguageStep } from '../components/steps/LanguageStep'
import { PasteStep } from '../components/steps/PasteStep'
import { SentencesStep } from '../components/steps/SentencesStep'
import { TranslateStep } from '../components/steps/TranslateStep'
import { ErrorCheckStep } from '../components/steps/ErrorCheckStep'
import { FinalTextStep } from '../components/steps/FinalTextStep'
import { parseSentences } from '../features/translation/sentences'
import { languagesSummary } from '../features/translation/languages'
import { BackupStep } from '../components/steps/BackupStep'
import { AudiobookStep } from '../components/steps/AudiobookStep'

// Steps without an entry here are shown as locked until they are built.
const BODIES: Partial<Record<StepKey, ReactNode>> = {
  intro: <IntroStep />,
  title: <TitleStep />,
  folder: <FolderStep />,
  language: <LanguageStep />,
  text: <PasteStep />,
  sentences: <SentencesStep />,
  translate: <TranslateStep />,
  errors: <ErrorCheckStep />,
  final: <FinalTextStep />,
  backup: <BackupStep />,
  audiobook: <AudiobookStep />,
}

export function App() {
  const { theme, draft, toggleStep, setFocus } = useStore()
  // Language of the dictionary shown instead of the translation steps, if any.
  const [dictionaryLanguage, setDictionaryLanguage] = useState<string | null>(null)

  // The theme class lives on <html> so the CSS variables apply to the whole page.
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  // Restores the field that was focused when this translation was last open.
  useEffect(() => {
    if (draft.focus) document.getElementById(draft.focus)?.focus()
  }, [draft.id])

  const paragraphs = parseSentences(draft.sentences)
  const sentenceCount = paragraphs.reduce((total, paragraph) => total + paragraph.length, 0)
  const translatedCount = Object.values(draft.translations).filter((t) => t.text.trim()).length
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

  const summaries: Partial<Record<StepKey, string | undefined>> = {
    intro: 'AI Optimized Multi-Lingual Translation',
    title: draft.title || undefined,
    folder: draft.folder || (draft.done.includes('folder') ? 'No folder' : undefined),
    language: draft.language ? languagesSummary(draft.language, draft.sourceLanguages) : undefined,
    sentences: draft.done.includes('sentences') ? `${plural(sentenceCount, 'sentence')} in ${plural(paragraphs.length, 'paragraph')}` : undefined,
    translate: translatedCount > 0 ? `${translatedCount} of ${plural(sentenceCount, 'sentence')} translated` : undefined,
    text: draft.text ? draft.text.replace(/\s+/g, ' ') : undefined,
  }

  const statusOf = (i: number): 'done' | 'active' | 'locked' | 'unbuilt' => {
    const step = STEPS[i]
    if (!(step.key in BODIES)) return 'unbuilt'
    if (draft.done.includes(step.key)) return 'done'
    const previousDone = i === 0 || draft.done.includes(STEPS[i - 1].key)
    return previousDone || step.gated === false ? 'active' : 'locked'
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar dictionary={dictionaryLanguage} onOpenDictionary={setDictionaryLanguage} onLeaveDictionary={() => setDictionaryLanguage(null)} />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
        {/* A dictionary replaces the steps; the steps are keyed on the draft id so inputs reset when switching translations. */}
        {dictionaryLanguage ? (
          <DictionaryView key={dictionaryLanguage} language={dictionaryLanguage} onBack={() => setDictionaryLanguage(null)} />
        ) : (
          <div key={draft.id} onFocus={(e) => e.target.id && e.target.id !== draft.focus && setFocus(e.target.id)} className="mx-auto max-w-3xl space-y-3">
            {STEPS.map((s, i) => (
              <StepCard
                key={s.key}
                n={i + 1}
                title={s.title}
                status={statusOf(i)}
                open={draft.open.includes(s.key)}
                summary={summaries[s.key]}
                onToggle={() => toggleStep(s.key)}
              >
                {BODIES[s.key]}
              </StepCard>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
