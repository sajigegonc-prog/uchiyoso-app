'use client'
import { useFormStatus } from 'react-dom'
import { useT } from '@/lib/i18n/client'

export default function DeleteOCButton() {
  const t = useT()
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(t('本当にこのOCを削除しますか？この操作は取り消せません。'))) {
          e.preventDefault()
        }
      }}
      style={{
        width: '100%', padding: 12, border: '1px solid #8a2418',
        background: '#fff', color: '#8a2418', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        letterSpacing: '.05em',
      }}
    >
      {pending ? t('削除中…') : t('このOCを削除する')}
    </button>
  )
}
