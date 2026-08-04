'use client'
import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import useKeyboardOffset from '@/components/useKeyboardOffset'

function ClearOnDone({ inputRef }) {
  const { pending } = useFormStatus()
  const wasPending = useRef(false)
  if (wasPending.current && !pending && inputRef.current) {
    inputRef.current.value = ''
  }
  wasPending.current = pending
  return null
}

export default function OocPanel({ roomId, myUserId, messages, sendAction, onClose }) {
  const inputRef = useRef(null)
  const keyboardOffset = useKeyboardOffset()
  const now = new Date()
  const timeLabel = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#f3e9d8', zIndex: 90,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ background: '#3d2d1c', color: '#f3e9d8', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>中の人チャット</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>現在時刻 {timeLabel}</span>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#f3e9d8', fontSize: 18, cursor: 'pointer' }}>×</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 74px' }}>
        {(!messages || messages.length === 0) && (
          <p style={{ fontSize: 12.5, color: '#8b7355', textAlign: 'center', marginTop: 20 }}>まだメッセージがありません。</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages && messages.map((msg) => {
            const mine = msg.user_id === myUserId
            if (msg.is_system) {
              return (
                <div key={msg.id} style={{ textAlign: 'center', fontSize: 12, color: '#8b7355', whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
              )
            }
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: 10.5, color: '#8b7355', marginBottom: 2 }}>{msg.senderName}</div>
                <div style={{
                  maxWidth: '75%', padding: '9px 13px', borderRadius: 3, fontSize: 14, lineHeight: 1.5,
                  background: mine ? '#5c3a21' : '#fff', color: mine ? '#f3e9d8' : '#241a10',
                  border: mine ? 'none' : '2px solid #d8c7ac',
                }}>
                  {msg.content}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <form
        action={sendAction}
        style={{
          position: 'fixed', left: 0, right: 0, bottom: keyboardOffset,
          display: 'flex', gap: 8, padding: '12px 16px', borderTop: '2px solid #8b6a4a', background: '#fff', zIndex: 95,
        }}
      >
        <input type="hidden" name="room_id" value={roomId} />
        <input
          ref={inputRef}
          name="content"
          placeholder="中の人として発言"
          style={{ flex: 1, border: '2px solid #8b6a4a', borderRadius: 3, padding: '10px 12px', fontSize: 16, background: '#fbf5e9', color: '#241a10' }}
        />
        <button type="submit" style={{ border: 'none', borderRadius: 3, background: '#8b5a2b', color: '#f3e9d8', fontWeight: 700, fontSize: 13, padding: '0 16px' }}>
          送信
        </button>
        <ClearOnDone inputRef={inputRef} />
      </form>
    </div>
  )
}
