'use client'
import { useState } from 'react'

export default function DeleteRoomButton({ roomId, label, action, transcript }) {
  const [confirming, setConfirming] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(transcript || '')
    setCopied(true)
  }

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
          position: 'fixed', inset: 0, background: 'rgba(33,29,23,.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110,
        }}>
          <div style={{ background: '#f4eee0', border: '1px solid #211d17', padding: 20, maxWidth: 340, width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif' }}>
              おしゃべりをやめますか？
            </div>
            <p style={{ fontSize: 11, color: '#8a2418', marginTop: 8, lineHeight: 1.7 }}>
              このルームはこの後消去され、元に戻せません。ログはこの場でのみ表示され、保存されません。
            </p>
            <p style={{ fontSize: 10.5, color: '#6b6250', marginTop: 6, lineHeight: 1.7, fontStyle: 'italic' }}>
              下のログをコピーし、ホーム画面の「過去のおしゃべりを思い出す」に貼ると、後から見返せます。★の付いた発言があなたのキャラです。
            </p>
            <textarea
              readOnly
              value={transcript || ''}
              style={{ marginTop: 10, flex: 1, minHeight: 140, fontSize: 12, padding: 10, border: '1px solid #8a8168', background: '#fff', color: '#211d17', resize: 'none' }}
            />
            <button
              type="button"
              onClick={handleCopy}
              style={{ marginTop: 10, padding: 9, border: '1px solid #211d17', background: '#fff', color: '#211d17', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
            >
              {copied ? 'コピーしました' : 'ログをコピーする'}
            </button>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                style={{ flex: 1, padding: 10, border: '1px solid #8a8168', background: '#fff', color: '#6b6250', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
              >
                キャンセル
              </button>
              <form action={action} style={{ flex: 1 }}>
                <input type="hidden" name="room_id" value={roomId} />
                <button
                  type="submit"
                  style={{ width: '100%', padding: 10, border: '1px solid #8a2418', background: '#8a2418', color: '#f4eee0', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                >
                  はい、やめる
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
