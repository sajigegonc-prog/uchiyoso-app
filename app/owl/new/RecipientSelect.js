'use client'
import { useState } from 'react'
import { lightFieldLabelStyle, lightInputStyle, lightBtnStyle } from '../../ocs/styles'
import SubmitButton from '@/components/SubmitButton'

export default function RecipientSelect({ action, myOcs, recipients }) {
  const [senderOcId, setSenderOcId] = useState(myOcs[0]?.id || '')

  return (
    <form action={action} style={{ width: '100%', maxWidth: 360, marginTop: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <label style={lightFieldLabelStyle}>差出人(あなたのOC)</label>
        <select
          name="sender_oc_id"
          style={lightInputStyle}
          value={senderOcId}
          onChange={(e) => setSenderOcId(e.target.value)}
        >
          {myOcs.map((oc) => (
            <option key={oc.id} value={oc.id}>{oc.name}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={lightFieldLabelStyle}>宛先</label>
        {recipients.length === 0 && (
          <p style={{ fontSize: 12.5, color: '#8b7355' }}>送れる相手がいません。フレンドを追加するか、他のOCを登録してください。</p>
        )}
        {recipients.length > 0 && (
          <select name="recipient_oc_id" style={lightInputStyle} defaultValue="">
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
        <label style={lightFieldLabelStyle}>本文</label>
        <textarea name="content" placeholder="手紙の内容を書いてください" style={{ ...lightInputStyle, minHeight: 120, resize: 'none' }} />
      </div>
      <SubmitButton style={lightBtnStyle} pendingText="送信中…">この内容で送る</SubmitButton>
    </form>
  )
}
