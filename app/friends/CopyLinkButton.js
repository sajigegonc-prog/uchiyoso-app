'use client'
import { useState } from 'react'
import { useT } from '@/lib/i18n/client'

export default function CopyLinkButton({ text }) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      style={{
        flex: 1, padding: 9, border: 'none', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
        background: copied ? '#3b6b4a' : '#211d17', color: '#f4eee0',
      }}
    >
      {copied ? t('コピーしました') : t('リンクをコピー')}
    </button>
  )
}
