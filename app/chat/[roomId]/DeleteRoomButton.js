'use client'
import { useState } from 'react'

export default function DeleteRoomButton({ roomId, label, action }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <button
        id="coach-exit-btn"
        type="button"
        onClick={() => setConfirming(true)}
        style={{ fontSize: 11, color: '#c9a876', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        {label}
      </button>

      {confirming && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(36,26,16,.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110,
        }}>
          <div style={{ background: '#fbf5e9', borderRadius: 3, padding: 22, maxWidth: 300, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#241a10', lineHeight: 1.8 }}>
              {label}しますか？<br />
              <span style={{ fontSize: 11.5, color: '#8b7355' }}>この操作は取り消せません。</span>
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                style={{ flex: 1, padding: 10, borderRadius: 3, border: '2px solid #d8c7ac', background: '#fff', color: '#8b7355', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
              >
                キャンセル
              </button>
              <form action={action} style={{ flex: 1 }}>
                <input type="hidden" name="room_id" value={roomId} />
                <button
                  type="submit"
                  style={{ width: '100%', padding: 10, borderRadius: 3, border: 'none', background: '#8b5a2b', color: '#f3e9d8', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                >
                  はい
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
