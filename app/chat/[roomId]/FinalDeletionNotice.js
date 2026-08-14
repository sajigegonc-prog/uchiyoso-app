'use client'
import { useState } from 'react'

export default function FinalDeletionNotice({ roomId, action, transcript, reason }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(transcript || '')
    setCopied(true)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(33,29,23,.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120,
    }}>
      <div style={{ background: '#f4eee0', border: '1px solid #211d17', padding: 20, maxWidth: 340, width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 13.5, color: '#211d17', lineHeight: 1.8 }}>
          {reason || '相手が立ち去ってしまったようです。'}このルームはこのまま消去されます。ログを保存したい場合は以下のログを保存してください。
        </div>
        <p style={{ fontSize: 10.5, color: '#6b6250', marginTop: 8, lineHeight: 1.7, fontStyle: 'italic' }}>
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
        <form action={action} style={{ marginTop: 14 }}>
          <input type="hidden" name="room_id" value={roomId} />
          <button
            type="submit"
            style={{ width: '100%', padding: 10, border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
          >
            了解しました
          </button>
        </form>
      </div>
    </div>
  )
}
