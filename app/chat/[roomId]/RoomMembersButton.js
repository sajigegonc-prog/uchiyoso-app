'use client'
import { useState } from 'react'

export default function RoomMembersButton({ members, pendingMembers }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button id="coach-members-btn" type="button" onClick={() => setOpen(true)}
        style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: '1px solid #211d17', background: '#f4eee0', fontSize: 15, cursor: 'pointer' }}
        aria-label="メンバー一覧">
        👥
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
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', filter: 'grayscale(1)', opacity: .5 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', background: '#8a8168', flexShrink: 0 }}>
                  {m.icon_url && <img src={m.icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <span style={{ fontSize: 13, color: '#6b6250' }}>{m.name}(承諾待ち)</span>
              </div>
            ))}
            <button type="button" onClick={() => setOpen(false)} style={{ display: 'block', width: '100%', marginTop: 14, padding: 9, border: '1px solid #211d17', background: '#fff', color: '#211d17', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>閉じる</button>
          </div>
        </div>
      )}
    </>
  )
}
