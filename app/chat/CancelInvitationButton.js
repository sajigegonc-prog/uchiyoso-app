'use client'
import { useTransition } from 'react'
import { useT } from '@/lib/i18n/client'

export default function CancelInvitationButton({ invitationId, roomId, action }) {
  const t = useT()
  const [isPending, startTransition] = useTransition()

  function handleClick(e) {
    e.preventDefault()
    if (!confirm(t('この申請を取り消しますか？'))) return
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
      {isPending ? t('取り消し中…') : t('取り消す')}
    </button>
  )
}
