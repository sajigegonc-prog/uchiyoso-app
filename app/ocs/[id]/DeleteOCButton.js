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
        width: '100%', padding: 13, borderRadius: 3, border: '2px solid #b3402c',
        background: '#fff', color: '#b3402c', fontWeight: 700, fontSize: 14, cursor: 'pointer',
      }}
    >
      {pending ? '削除中…' : 'このOCを削除する'}
    </button>
  )
}
