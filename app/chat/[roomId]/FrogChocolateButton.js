'use client'
import { useState } from 'react'
import Image from 'next/image'

const NAVY = '#22335c'
const NAVY_DEEP = '#182647'
const GOLD = '#c9a227'
const GOLD_SOFT = '#dbb84a'
const CREAM = '#f4eee0'

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
          position: 'relative', flexShrink: 0, width: 44, height: 44,
          border: 'none', background: 'none',
          fontSize: 15, cursor: 'pointer', marginBottom: 2,
        }}
        aria-label="蛙チョコを開ける"
      >
        <Image src="/images/frog-choc-button.png" alt="" fill sizes="44px" style={{ objectFit: 'contain', objectPosition: 'center 40%' }} />
        {hasUnread && (
          <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#8a2418', border: '1px solid #f4eee0' }} />
        )}
      </button>

      {confirming && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(24,38,71,.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            width: '90%', maxWidth: 300, padding: '22px 20px 20px', position: 'relative',
            background: `radial-gradient(circle at 50% 0%, #2c4170 0%, ${NAVY} 55%, ${NAVY_DEEP} 100%)`,
            border: `2px solid ${GOLD}`, borderRadius: 4,
            boxShadow: '0 18px 40px rgba(0,0,0,.35), inset 0 0 0 1px rgba(201,162,39,.25)',
          }}>
            <div style={{ position: 'absolute', inset: 6, border: '1px solid rgba(201,162,39,.45)', borderRadius: 2, pointerEvents: 'none' }} />
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ width: 76, margin: '0 auto 10px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.4))' }}>
                <Image src="/images/frog-choc-button.png" alt="" width={76} height={76} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
              </div>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.85, textAlign: 'center', color: CREAM, margin: '0 0 4px' }}>
              {speakerName}として蛙チョコを開けますか？
            </p>
            <p style={{ fontSize: 11, color: '#c7bfa4', textAlign: 'center', margin: '6px 0 0', fontStyle: 'italic' }}>
              (結果は中の人チャットにログとして残ります)
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                style={{ flex: 1, padding: 11, border: '1px solid rgba(244,238,224,.45)', background: 'transparent', color: '#d9d2bd', fontWeight: 700, fontSize: 12.5, borderRadius: 2, cursor: 'pointer' }}
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
                style={{
                  flex: 1, padding: 11, border: '1px solid #8f721c', borderRadius: 2,
                  background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD})`,
                  color: NAVY_DEEP, fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                  boxShadow: '0 2px 0 #8f721c',
                }}
              >
                {pending ? '開けています…' : 'はい'}
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(24,38,71,.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}
          onClick={() => setResult(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '90%', maxWidth: 320, padding: '22px 20px 20px', position: 'relative', textAlign: 'center',
              background: `radial-gradient(circle at 50% 0%, #2c4170 0%, ${NAVY} 55%, ${NAVY_DEEP} 100%)`,
              border: `2px solid ${GOLD}`, borderRadius: 4,
              boxShadow: '0 18px 40px rgba(0,0,0,.35), inset 0 0 0 1px rgba(201,162,39,.25)',
            }}
          >
            <div style={{ position: 'absolute', inset: 6, border: '1px solid rgba(201,162,39,.45)', borderRadius: 2, pointerEvents: 'none' }} />
            <div style={{ width: 150, margin: '0 auto 12px', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,.45))' }}>
              <Image src="/images/frog-choc-button.png" alt="" width={150} height={150} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: GOLD_SOFT, letterSpacing: '.04em', marginTop: 2, fontFamily: 'Georgia, serif' }}>
              {result.name}
            </div>
            <div style={{ width: 60, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: '10px auto 12px' }} />
            <p style={{ fontSize: 12.5, lineHeight: 1.8, color: '#e3ddc9', padding: '0 6px' }}>{result.description}</p>
            <button
              type="button"
              onClick={() => setResult(null)}
              style={{
                marginTop: 18, padding: '9px 30px', borderRadius: 2, border: '1px solid #8f721c',
                background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD})`,
                color: NAVY_DEEP, fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                boxShadow: '0 2px 0 #8f721c',
              }}
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