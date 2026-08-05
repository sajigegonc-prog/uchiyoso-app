'use client'
import { useState } from 'react'

export default function AddMemberButton({ roomId, action, friendOcs }) {
  const [open, setOpen] = useState(false)
  if (!friendOcs || friendOcs.length === 0) return null

  const groups = new Map()
  for (const f of friendOcs) {
    if (!groups.has(f.friend_display_name)) groups.set(f.friend_display_name, [])
    groups.get(f.friend_display_name).push(f)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ fontSize: 11, color: '#6b6250', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        +メンバー招待
      </button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(33,29,23,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div style={{ background: '#f4eee0', border: '1px solid #211d17', padding: 20, maxWidth: 320, width: '90%', maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#211d17', marginBottom: 10, fontFamily: 'Georgia, serif' }}>招待するOCを選ぶ</div>
            <form action={action} onSubmit={() => setOpen(false)}>
              <input type="hidden" name="room_id" value={roomId} />
              {[...groups.entries()].map(([label, ocs]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10.5, color: '#6b6250', marginBottom: 6, fontStyle: 'italic' }}>{label}</div>
                  {ocs.map((oc) => (
                    <label key={oc.oc_id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#211d17', marginTop: 4 }}>
                      <input type="checkbox" name="friend_oc_ids" value={oc.oc_id} style={{ width: 16, height: 16 }} />
                      {oc.oc_name}
                    </label>
                  ))}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, padding: 9, border: '1px solid #8a8168', background: '#fff', color: '#6b6250', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                  キャンセル
                </button>
                <button type="submit" style={{ flex: 1, padding: 9, border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                  招待する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
