'use client'
import { useState } from 'react'

export default function RoomTitleEditor({ roomId, title, fallback, action }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(title || '')
  const [pending, setPending] = useState(false)

  if (!editing) {
    return (
      <div onClick={() => { setValue(title || ''); setEditing(true) }} style={{
        fontSize: 17, fontWeight: 700, marginTop: 8, color: '#211d17', fontFamily: 'Georgia, serif',
        cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {title || fallback}
      </div>
    )
  }
  return (
    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
      <input value={value} onChange={(e) => setValue(e.target.value)} maxLength={40} placeholder={fallback}
        style={{ flex: 1, fontSize: 14, padding: '6px 8px', border: '1px solid #211d17', background: '#fff', color: '#211d17' }} />
      <button type="button" disabled={pending}
        onClick={async () => { setPending(true); await action(roomId, value); setPending(false); setEditing(false) }}
        style={{ fontSize: 12, padding: '6px 10px', background: '#211d17', color: '#f4eee0', border: 'none', cursor: 'pointer' }}>保存</button>
      <button type="button" onClick={() => setEditing(false)}
        style={{ fontSize: 12, padding: '6px 10px', background: '#fff', color: '#6b6250', border: '1px solid #8a8168', cursor: 'pointer' }}>×</button>
    </div>
  )
}
