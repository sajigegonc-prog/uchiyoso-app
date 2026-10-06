'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function RoomMembersButton({ members, pendingMembers, hasUnread, roomId, cancelAction }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleCancel(invitationId) {
    if (!confirm('この招待を取り消しますか？')) return
    const formData = new FormData()
    formData.set('invitation_id', invitationId)
    formData.set('room_id', roomId)
    startTransition(async () => {
      const res = await cancelAction(formData)
      if (res?.deleted) {
        router.push('/chat')
      } else {
        router.refresh()
      }
    })
  }
  return (
    <>
      <button id="coach-members-btn" type="button" onClick={() => setOpen(true)}
        style={{ position: 'relative', flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: '1px solid #211d17', background: '#f4eee0', fontSize: 15, cursor: 'pointer' }}
        aria-label="メンバー一覧">
        👥
        {hasUnread && (
          <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#8a2418', border: '1px solid #f4eee0' }} />
        )}
      </button>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(33,29,23,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#f4eee0', border: '1px solid #211d17', padding: 18, maxWidth: 300, width: '90%' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif', borderBottom: '1px solid #211d17', paddingBottom: 8, marginBottom: 10 }}>この部屋のメンバー</div>
            {members.map((m) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', background: '#211d17', flexShrink: 0 }}>
                  {m.icon_url && <img src={m.icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <span style={{ fontSize: 13, color: '#211d17' }}>{m.name}</span>
              </div>
            ))}
            {pendingMembers.map((m) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, filter: 'grayscale(1)', opacity: .5 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', background: '#8a8168', flexShrink: 0 }}>
                    {m.icon_url && <img src={m.icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <span style={{ fontSize: 13, color: '#6b6250' }}>{m.name}(承諾待ち)</span>
                </div>
                {m.canCancel && m.invitationId && (
                  <button type="button" onClick={() => handleCancel(m.invitationId)} disabled={isPending}
                    aria-label="招待を取り消す"
                    style={{ flexShrink: 0, width: 18, height: 18, lineHeight: '16px', padding: 0, border: '1px solid #8a2418', background: '#fff', color: '#8a2418', fontSize: 12, borderRadius: 3, cursor: 'pointer' }}>
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setOpen(false)} style={{ display: 'block', width: '100%', marginTop: 14, padding: 9, border: '1px solid #211d17', background: '#fff', color: '#211d17', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>閉じる</button>
          </div>
        </div>
      )}
    </>
  )
}
