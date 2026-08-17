'use client'
import { useTransition } from 'react'

export default function CancelInvitationButton({ invitationId, roomId, action }) {
  const [isPending, startTransition] = useTransition()

  function handleClick(e) {
    e.preventDefault()
    if (!confirm('この申請を取り消しますか？')) return
    const formData = new FormData()
    formData.set('invitation_id', invitationId)
    formData.set('room_id', roomId)
    startTransition(async () => {
      await action(formData)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      style={{
        fontSize: 10.5, color: '#8a2418', background: 'none', border: 'none',
        textDecoration: 'underline', cursor: 'pointer', padding: 0, flexShrink: 0,
        fontFamily: 'inherit',
      }}
    >
      {isPending ? '取り消し中…' : '取り消す'}
    </button>
  )
}
