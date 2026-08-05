'use client'
import { useState } from 'react'
import SubmitButton from '@/components/SubmitButton'

const labelStyle = { fontSize: 11, color: '#6b6250', display: 'block', marginBottom: 5, letterSpacing: '.05em' }
const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 15,
  background: '#fff', border: '1px solid #211d17', color: '#211d17',
  boxSizing: 'border-box', fontFamily: "'BIZ UDPGothic', sans-serif",
}
const btnStyle = {
  width: '100%', padding: 12, border: '1px solid #211d17',
  fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 18,
  background: '#211d17', color: '#f4eee0', letterSpacing: '.05em',
}

export default function RecipientSelect({ action, myOcs, recipients, initialSenderOcId, initialRecipientOcId }) {
  const [senderOcId, setSenderOcId] = useState(initialSenderOcId || myOcs[0]?.id || '')

  return (
    <form action={action} style={{ width: '100%', maxWidth: 360, marginTop: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>差出人(あなたのOC)</label>
        <select name="sender_oc_id" style={inputStyle} value={senderOcId} onChange={(e) => setSenderOcId(e.target.value)}>
          {myOcs.map((oc) => (
            <option key={oc.id} value={oc.id}>{oc.name}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>宛先</label>
        {recipients.length === 0 && (
          <p style={{ fontSize: 12.5, color: '#8a8168', fontStyle: 'italic' }}>送れる相手がいません。フレンドを追加するか、他のOCを登録してください。</p>
        )}
        {recipients.length > 0 && (
          <select name="recipient_oc_id" style={inputStyle} defaultValue={initialRecipientOcId || ''}>
            <option value="" disabled>選んでください</option>
            {recipients.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.ocs.map((oc) => (
                  <option key={oc.id} value={oc.id}>{oc.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>本文</label>
        <textarea
          name="content"
          placeholder="手紙の内容を書いてください"
          style={{
            width: '100%', minHeight: 140, padding: 14, fontSize: 14, lineHeight: 1.8,
            background: 'linear-gradient(160deg, #f3e6c8 0%, #e8d6ac 55%, #ddc794 100%)',
            border: '1px solid #c9a876', color: '#3d2c14', resize: 'none',
            fontFamily: "'BIZ UDPGothic', sans-serif", boxSizing: 'border-box',
          }}
        />
      </div>
      <SubmitButton style={btnStyle} pendingText="送信中…">この内容で送る</SubmitButton>
    </form>
  )
}
