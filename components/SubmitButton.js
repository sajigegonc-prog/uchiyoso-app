'use client'
import { useFormStatus } from 'react-dom'
import { useT } from '@/lib/i18n/client'
export default function SubmitButton({ children, pendingText, style }) {
  const t = useT()
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{ ...style, opacity: pending ? 0.6 : 1, cursor: pending ? 'default' : 'pointer' }}
    >
      {pending ? (pendingText ?? t('送信中…')) : children}
    </button>
  )
}
