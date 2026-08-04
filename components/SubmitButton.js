'use client'
import { useFormStatus } from 'react-dom'
export default function SubmitButton({ children, pendingText = '送信中…', style }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{ ...style, opacity: pending ? 0.6 : 1, cursor: pending ? 'default' : 'pointer' }}
    >
      {pending ? pendingText : children}
    </button>
  )
}
