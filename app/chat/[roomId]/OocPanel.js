'use client'
import { useRef, useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { createPortal } from 'react-dom'
import { markOocRead } from './oocActions'
import CoachMark from '@/components/CoachMark'
import useTypingChannel from '@/lib/useTypingChannel'
import TypingDots from '@/components/TypingDots'

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

export default function OocPanel({ roomId, myUserId, messages, sendAction, onClose, drawAction, showGachaTutorial, markGachaTutorialSeenAction, logAction, showLogTutorial, markLogTutorialSeenAction }) {
  const inputRef = useRef(null)
  const submittingRef = useRef(false)
  const [mounted, setMounted] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [logConfirming, setLogConfirming] = useState(false)
  const [logTranscript, setLogTranscript] = useState(null)
  const [logCopied, setLogCopied] = useState(false)
  const { typerNames, sendTyping } = useTypingChannel(`typing-ooc-${roomId}`, myUserId)
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
    function scrollToBottom() {
      const el = document.getElementById('ooc-bottom-anchor')
      if (el) el.scrollIntoView({ block: 'end' })
    }
    scrollToBottom()
    const t1 = setTimeout(scrollToBottom, 100)
    const t2 = setTimeout(scrollToBottom, 400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
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

  async function handleDraw() {
    setDrawing(true)
    await drawAction(roomId)
    setDrawing(false)
  }

  async function handleShowLog() {
    const result = await logAction(roomId)
    setLogTranscript(result?.transcript || '')
    setLogConfirming(false)
  }

  function handleCopyLog() {
    navigator.clipboard.writeText(logTranscript || '')
    setLogCopied(true)
  }

  if (!mounted) return null

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, background: '#1c2133', zIndex: 90,
      display: 'flex', flexDirection: 'column',
      height: '100dvh',
    }}>
      {showGachaTutorial && (
        <CoachMark
          steps={[
            { targetId: 'coach-ooc-gacha-btn', text: 'シチュエーションガチャです。押すと場所や時間帯がランダムに決まり、そのまま部屋に反映されます。' },
          ]}
          onFinish={markGachaTutorialSeenAction}
        />
      )}
      {!showGachaTutorial && showLogTutorial && (
        <CoachMark
          steps={[
            { targetId: 'coach-ooc-log-btn', text: '場面転換や退出をしなくても、今のログをいつでも書き出せます。書き出したログはホームの「過去のおしゃべりを思い出す」に貼ると、後から見返せます。' },
          ]}
          onFinish={markLogTutorialSeenAction}
        />
      )}
      <div style={{ background: '#12151f', color: '#c7ccdd', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderBottom: '1px solid #3a4360' }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.1em', fontFamily: "'Courier New', monospace" }}>MEMO — 中の人チャット</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#7a82a0', fontFamily: "'Courier New', monospace" }}>{timeLabel}</span>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#c7ccdd', fontSize: 18, cursor: 'pointer' }}>×</button>
        </div>
      </div>

      <div id="ooc-messages-scroll" style={{
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
          <TypingDots names={typerNames} dark />
          <div id="ooc-bottom-anchor" />
        </div>
      </div>

      <form id="ooc-input-row" action={sendAction} onSubmit={handleSubmit} style={{
        flexShrink: 0, display: 'flex', gap: 8, padding: '12px 16px',
        background: '#12151f', borderTop: '1px solid #3a4360',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      }}>
        <input type="hidden" name="room_id" value={roomId} />
        <button
          id="coach-ooc-gacha-btn"
          type="button"
          disabled={drawing}
          onClick={handleDraw}
          style={{
            flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
            border: 'none', background: drawing ? '#2f3a5c' : '#3d4d75', color: '#e8eaf5', fontSize: 15, cursor: 'pointer',
          }}
        >✨</button>
        <button
          id="coach-ooc-log-btn"
          type="button"
          onClick={() => setLogConfirming(true)}
          style={{
            flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
            border: 'none', background: '#2f3a5c', color: '#e8eaf5', fontSize: 15, cursor: 'pointer',
          }}
          aria-label="ログを書き出す"
        >📋</button>
        <input ref={inputRef} name="content" placeholder="中の人として発言" onChange={() => sendTyping('中の人')} style={{ flex: 1, border: '1px solid #3a4360', borderRadius: 3, padding: '10px 12px', fontSize: 16, background: '#252b40', color: '#e8eaf5', fontFamily: "'Courier New', monospace" }} />
        <SubmitBtn />
      </form>

      {logConfirming && (
        <div onClick={() => setLogConfirming(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#12151f', border: '1px solid #3a4360', borderRadius: 4, padding: 18, maxWidth: 300 }}>
            <p style={{ fontSize: 13, color: '#e4e8f2', marginBottom: 6 }}>現在のログを書き出しますか？</p>
            <p style={{ fontSize: 11, color: '#8a92b5', lineHeight: 1.7, marginBottom: 14 }}>場面転換や退出をしなくても、今の会話ログをいつでもコピーできます。</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setLogConfirming(false)} style={{ flex: 1, padding: 9, background: 'none', border: '1px solid #3a4360', color: '#8a92b5', borderRadius: 3, fontSize: 12 }}>キャンセル</button>
              <button type="button" onClick={handleShowLog} style={{ flex: 1, padding: 9, background: '#4a5580', border: 'none', color: '#e8eaf5', borderRadius: 3, fontSize: 12 }}>ログを表示</button>
            </div>
          </div>
        </div>
      )}

      {logTranscript !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#12151f', border: '1px solid #3a4360', borderRadius: 4, padding: 18, maxWidth: 340, width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: 13, color: '#e4e8f2', marginBottom: 6 }}>現在のログ</p>
            <p style={{ fontSize: 10.5, color: '#8a92b5', lineHeight: 1.7, marginBottom: 8 }}>ホームの「過去のおしゃべりを思い出す」に貼ると、いつでも見返せます。★の付いた発言があなたのキャラです。</p>
            <textarea readOnly value={logTranscript} style={{ flex: 1, minHeight: 160, fontSize: 12, padding: 10, border: '1px solid #3a4360', background: '#252b40', color: '#e8eaf5', resize: 'none', borderRadius: 3 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={() => { setLogTranscript(null); setLogCopied(false) }} style={{ flex: 1, padding: 9, background: 'none', border: '1px solid #3a4360', color: '#8a92b5', borderRadius: 3, fontSize: 12 }}>閉じる</button>
              <button type="button" onClick={handleCopyLog} style={{ flex: 1, padding: 9, background: '#4a5580', border: 'none', color: '#e8eaf5', borderRadius: 3, fontSize: 12 }}>{logCopied ? 'コピーしました' : 'コピーする'}</button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}