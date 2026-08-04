'use client'
import { useState } from 'react'

export default function FrogChocolateButton({ roomId, action }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(formData) {
    setPending(true)
    setError(null)
    const res = await action(formData)
    setPending(false)
    setConfirming(false)
    if (res?.error) {
      setError(res.error)
    } else if (res?.card) {
      setResult(res.card)
    }
  }

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
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                style={{ flex: 1, padding: 10, borderRadius: 3, border: '2px solid #d8c7ac', background: '#fff', color: '#8b7355', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  const formData = new FormData()
                  formData.set('room_id', roomId)
                  handleSubmit(formData)
                }}
                style={{ flex: 1, padding: 10, borderRadius: 3, border: 'none', background: '#8b5a2b', color: '#f3e9d8', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                {pending ? '開けています…' : 'はい'}
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(36,26,16,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}
          onClick={() => setResult(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fbf5e9', borderRadius: 3, padding: 20, maxWidth: 320, textAlign: 'center' }}
          >
            <div style={{ fontSize: 28 }}>🐸</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#241a10', marginTop: 8 }}>{result.name}</div>
            <p style={{ fontSize: 12.5, color: '#5c3a21', marginTop: 10, lineHeight: 1.7 }}>{result.description}</p>
            <button
              type="button"
              onClick={() => setResult(null)}
              style={{ marginTop: 16, padding: '8px 20px', borderRadius: 3, border: 'none', background: '#8b5a2b', color: '#f3e9d8', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(36,26,16,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}
          onClick={() => setError(null)}
        >
          <div style={{ background: '#fbf5e9', borderRadius: 3, padding: 20, maxWidth: 300, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#b3402c' }}>{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              style={{ marginTop: 14, padding: '8px 20px', borderRadius: 3, border: 'none', background: '#8b5a2b', color: '#f3e9d8', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
}
