'use client'
import { useFormStatus } from 'react-dom'

export default function DeleteOCButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm('本当にこのOCを削除しますか？この操作は取り消せません。')) {
          e.preventDefault()
        }
      }}
      style={{
        width: '100%', padding: 12, border: '1px solid #8a2418',
        background: '#fff', color: '#8a2418', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        letterSpacing: '.05em',
      }}
    >
      {pending ? '削除中…' : 'このOCを削除する'}
    </button>
  )
}
