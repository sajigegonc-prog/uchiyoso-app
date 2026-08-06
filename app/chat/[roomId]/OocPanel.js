'use client'
import { useRef, useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { createPortal } from 'react-dom'
import { markOocRead } from './oocActions'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} style={{
      border: '1px solid #5a6a8a', borderRadius: 3, background: pending ? '#3a4360' : '#4a5580',
      color: '#e8eaf5', fontWeight: 700, fontSize: 13, padding: '0 16px', letterSpacing: '.03em',
    }}>
      {pending ? '…' : '送信'}
    </button>
  )
}

export default function OocPanel({ roomId, myUserId, messages, sendAction, onClose, drawAction }) {
  const inputRef = useRef(null)
  const submittingRef = useRef(false)
  const [mounted, setMounted] = useState(false)
  const now = new Date()
  const timeLabel = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    setMounted(true)
    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalPosition = document.body.style.position
    const originalWidth = document.body.style.width
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.top = `-${scrollY}px`
    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.position = originalPosition
      document.body.style.width = originalWidth
      document.body.style.top = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  useEffect(() => {
    markOocRead(roomId)
  }, [roomId, messages?.length])

  function handleSubmit(e) {
    if (submittingRef.current) { e.preventDefault(); return }
    submittingRef.current = true
    setTimeout(() => {
      submittingRef.current = false
      if (inputRef.current) inputRef.current.value = ''
    }, 600)
  }

  if (!mounted) return null

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, background: '#1c2133', zIndex: 90,
      display: 'flex', flexDirection: 'column',
      height: '100dvh',
    }}>
      <div style={{ background: '#12151f', color: '#c7ccdd', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderBottom: '1px solid #3a4360' }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.1em', fontFamily: "'Courier New', monospace" }}>MEMO — 中の人チャット</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#7a82a0', fontFamily: "'Courier New', monospace" }}>{timeLabel}</span>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#c7ccdd', fontSize: 18, cursor: 'pointer' }}>×</button>
        </div>
      </div>

      <div style={{
        flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: '16px',
        WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain',
      }}>
        {(!messages || messages.length === 0) && (
          <p style={{ fontSize: 12.5, color: '#7a82a0', textAlign: 'center', marginTop: 20, fontFamily: "'Courier New', monospace" }}>まだメッセージがありません。</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages && messages.map((msg) => {
            const mine = msg.user_id === myUserId
            if (msg.is_system) {
              return <div key={msg.id} style={{ textAlign: 'center', fontSize: 11.5, color: '#8a92b5', whiteSpace: 'pre-wrap', fontFamily: "'Courier New', monospace", padding: '4px 0' }}>{msg.content}</div>
            }
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: 10, color: '#7a82a0', marginBottom: 2, fontFamily: "'Courier New', monospace" }}>{msg.senderName}</div>
                <div style={{ maxWidth: '75%', padding: '9px 13px', borderRadius: 3, fontSize: 14, lineHeight: 1.5, background: mine ? '#4a5580' : '#252b40', color: '#e8eaf5', border: '1px solid #3a4360' }}>
                  {msg.content}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <form action={sendAction} onSubmit={handleSubmit} style={{
        flexShrink: 0, display: 'flex', gap: 8, padding: '12px 16px',
        background: '#12151f', borderTop: '1px solid #3a4360',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      }}>
        <input type="hidden" name="room_id" value={roomId} />
        <input ref={inputRef} name="content" placeholder="中の人として発言" style={{ flex: 1, border: '1px solid #3a4360', borderRadius: 3, padding: '10px 12px', fontSize: 16, background: '#252b40', color: '#e8eaf5', fontFamily: "'Courier New', monospace" }} />
      <button
          type="button"
          disabled={pending}
          onClick={async () => { setPending(true); await drawAction(roomId); setPending(false) }}
          style={{
            flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
            border: 'none', background: '#3d4d75', color: '#e8eaf5', fontSize: 15, cursor: 'pointer',
          }}
        >✨</button>
            <SubmitBtn />
      </form>
    </div>,
    document.body
  )
}
