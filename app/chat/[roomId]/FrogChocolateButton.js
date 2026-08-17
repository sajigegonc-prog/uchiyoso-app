'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function FrogChocolateButton({ roomId, action, speakerName, hasUnread }) {
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
        id="coach-frog-btn"
        type="button"
        onClick={() => setConfirming(true)}
        style={{
          position: 'relative', flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
          border: '1px solid #211d17', background: '#f4eee0',
          fontSize: 15, cursor: 'pointer', marginBottom: 2,
        }}
                aria-label="蛙チョコを開ける"
      >
        <Image src="/images/frog-choc-button.png" alt="" fill sizes="36px" style={{ objectFit: 'contain', padding: 3 }} />
        {hasUnread && (
          <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#8a2418', border: '1px solid #f4eee0' }} />
        )}
      </button>

      {confirming && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(33,29,23,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{ background: '#f4eee0', borderRadius: 3, padding: 20, maxWidth: 300, textAlign: 'center', border: '1px solid #211d17' }}>
            <p style={{ fontSize: 14, color: '#211d17', lineHeight: 1.7 }}>
              {speakerName}として蛙チョコを開けますか？<br />
              <span style={{ fontSize: 11.5, color: '#8a8168' }}>(結果は中の人チャットにログとして残ります)</span>
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                style={{ flex: 1, padding: 10, border: '1px solid #8a8168', background: '#fff', color: '#6b6250', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  const formData = new FormData()
                  formData.set('room_id', roomId)
                  formData.set('speaker_name', speakerName || '名前未設定')
                  handleSubmit(formData)
                }}
                style={{ flex: 1, padding: 10, border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                {pending ? '開けています…' : 'はい'}
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(33,29,23,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}
          onClick={() => setResult(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#f4eee0', borderRadius: 3, padding: 20, maxWidth: 320, textAlign: 'center', border: '1px solid #211d17' }}
          >
            <div style={{ fontSize: 28 }}>🐸</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#211d17', marginTop: 8, fontFamily: 'Georgia, serif' }}>{result.name}</div>
            <p style={{ fontSize: 12.5, color: '#5c3a21', marginTop: 10, lineHeight: 1.7 }}>{result.description}</p>
            <button
              type="button"
              onClick={() => setResult(null)}
              style={{ marginTop: 16, padding: '8px 20px', border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(33,29,23,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}
          onClick={() => setError(null)}
        >
          <div style={{ background: '#f4eee0', borderRadius: 3, padding: 20, maxWidth: 300, textAlign: 'center', border: '1px solid #211d17' }}>
            <p style={{ fontSize: 13, color: '#8a2418' }}>{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              style={{ marginTop: 14, padding: '8px 20px', border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
}
