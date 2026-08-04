'use client'
import { useState } from 'react'

export default function FrogChocolateButton({ roomId, action }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        style={{
          flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
          border: '2px solid #8b6a4a', background: '#fbf5e9',
          fontSize: 17, cursor: 'pointer',
        }}
        aria-label="蛙チョコを開ける"
      >
        🐸
      </button>

      {confirming && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(36,26,16,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{ background: '#fbf5e9', borderRadius: 3, padding: 20, maxWidth: 300, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#241a10', lineHeight: 1.7 }}>
              蛙チョコを開けますか？<br />
              <span style={{ fontSize: 11.5, color: '#8b7355' }}>(結果は中の人チャットにログとして残ります)</span>
            </p>
            <form
              action={async (formData) => {
                setPending(true)
                await action(formData)
                setPending(false)
                setConfirming(false)
              }}
              style={{ display: 'flex', gap: 8, marginTop: 16 }}
            >
              <input type="hidden" name="room_id" value={roomId} />
              <button
                type="button"
                onClick={() => setConfirming(false)}
                style={{ flex: 1, padding: 10, borderRadius: 3, border: '2px solid #d8c7ac', background: '#fff', color: '#8b7355', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={pending}
                style={{ flex: 1, padding: 10, borderRadius: 3, border: 'none', background: '#8b5a2b', color: '#f3e9d8', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                {pending ? '開けています…' : 'はい'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
