import { useState } from 'react'
import { copyText } from './clipboard'

/** Copy-to-clipboard with button feedback: `label` reads "Copied" or "Copy failed" for two seconds on the button that was pressed. */
export function useCopy<K extends string>() {
  const [result, setResult] = useState<{ key: K; ok: boolean } | null>(null)

  const copy = async (key: K, text: string) => {
    setResult({ key, ok: await copyText(text) })
    window.setTimeout(() => setResult(null), 2000)
  }
  const label = (key: K, idle: string) => (result?.key === key ? (result.ok ? 'Copied' : 'Copy failed') : idle)

  return { copy, label }
}
