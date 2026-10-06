'use client'
import { useRouter } from 'next/navigation'
import { useLocale } from './client'

const OPTIONS = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()

  function choose(code) {
    document.cookie = `lang=${code}; path=/; max-age=31536000; samesite=lax`
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }} aria-label="Language">
      <span style={{ fontSize: 11, color: '#6b6250' }}>🌐</span>
      {OPTIONS.map((o) => (
        <button
          key={o.code}
          type="button"
          onClick={() => choose(o.code)}
          style={{
            fontSize: 11.5, padding: '4px 10px', cursor: 'pointer',
            border: '1px solid #211d17',
            background: locale === o.code ? '#211d17' : '#fff',
            color: locale === o.code ? '#f4eee0' : '#211d17',
            fontWeight: locale === o.code ? 700 : 400,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
