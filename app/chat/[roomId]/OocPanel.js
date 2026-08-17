'use client'
import { useRef, useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { createPortal } from 'react-dom'
import { markOocRead } from './oocActions'
import CoachMark from '@/components/CoachMark'
import useTypingChannel from '@/lib/useTypingChannel'
import TypingDots from '@/components/TypingDots'
import useKeyboardOffset from '@/components/useKeyboardOffset'
import { resizeImageFile } from './resizeImage'
import { createClient } from '@/lib/supabaseClient'

function SubmitBtn({ cooldown }) {
  const { pending } = useFormStatus()
  const disabled = pending || cooldown
  return (
    <button type="submit" disabled={disabled} style={{
      border: '1px solid #5a6a8a', borderRadius: 3, background: disabled ? '#3a4360' : '#4a5580',
      color: '#e8eaf5', fontWeight: 700, fontSize: 13, padding: '0 16px', letterSpacing: '.03em',
    }}>
      {pending ? '…' : '送信'}
    </button>
  )
}

export default function OocPanel({
  roomId, myUserId, myDisplayName, messages, sendAction, onClose,
  drawAction, proposeAction, respondAction, pendingSituation,
  showGachaTutorial, markGachaTutorialSeenAction, logAction, showLogTutorial, markLogTutorialSeenAction,
}) {
  const inputRef = useRef(null)
  const submittingRef = useRef(false)
  const lastSentRef = useRef(0)
  const [cooldown, setCooldown] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [logConfirming, setLogConfirming] = useState(false)
  const [logTranscript, setLogTranscript] = useState(null)
  const [logCopied, setLogCopied] = useState(false)
  const { typerNames, sendTyping } = useTypingChannel(`typing-ooc-${roomId}`, myUserId)
  const keyboardOffset = useKeyboardOffset()

  const [extrasOpen, setExtrasOpen] = useState(true)

  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [situationOpen, setSituationOpen] = useState(false)
  const [situationMode, setSituationMode] = useState('gacha')
  const [drawResult, setDrawResult] = useState(null)
  const [drawing, setDrawing] = useState(false)
  const [customPlace, setCustomPlace] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [customText, setCustomText] = useState('')
  const [proposing, setProposing] = useState(false)
  const [respondPending, setRespondPending] = useState(false)

  const LINE_HEIGHT = 20
  const MAX_LINES = 5
  function autoResize() {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    const maxHeight = LINE_HEIGHT * MAX_LINES + 16
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
  }
  const now = new Date()
  const timeLabel = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    setMounted(true)
    function scrollToBottom() {
      const el = document.getElementById('ooc-bottom-anchor')
      if (el) el.scrollIntoView({ block: 'end' })
    }
    scrollToBottom()
    const t1 = setTimeout(scrollToBottom, 100)
    const t2 = setTimeout(scrollToBottom, 400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    markOocRead(roomId)
  }, [roomId, messages?.length])

  function canSubmitNow() {
    const nowTs = Date.now()
    if (submittingRef.current || nowTs - lastSentRef.current < 2000) return false
    return true
  }

  function markSubmitted() {
    lastSentRef.current = Date.now()
    submittingRef.current = true
    setCooldown(true)
    setTimeout(() => setCooldown(false), 2000)
    setTimeout(() => {
      submittingRef.current = false
    }, 600)
  }

  async function handleFormSubmit(e) {
    if (!canSubmitNow()) {
      e.preventDefault()
      return
    }

    if (selectedImage) {
      e.preventDefault()
      markSubmitted()
      setUploading(true)
      try {
        const supabase = createClient()
        const path = `${myUserId}/${roomId}/${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage.from('ooc-images').upload(path, selectedImage, { contentType: 'image/jpeg' })
        if (!uploadError) {
          const { data } = supabase.storage.from('ooc-images').getPublicUrl(path)
          const formData = new FormData(e.target)
          formData.set('image_url', data.publicUrl)
          await sendAction(formData)
        }
      } finally {
        setUploading(false)
        clearImage()
        if (inputRef.current) { inputRef.current.value = ''; autoResize() }
      }
      return
    }

    markSubmitted()
    setTimeout(() => {
      if (inputRef.current) { inputRef.current.value = ''; autoResize() }
    }, 600)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }

  async function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const resized = await resizeImageFile(file)
    setSelectedImage(resized)
    setImagePreview(URL.createObjectURL(resized))
    e.target.value = ''
  }

  function clearImage() {
    setSelectedImage(null)
    setImagePreview(null)
  }

  function openGacha() {
    setSituationMode('gacha')
    setSituationOpen(true)
    handleDraw()
  }
  function openCustom() {
    setSituationMode('custom')
    setCustomPlace(''); setCustomTime(''); setCustomText('')
    setSituationOpen(true)
  }
  async function handleDraw() {
    setDrawing(true)
    const result = await drawAction(roomId)
    setDrawResult(result?.error ? null : result)
    setDrawing(false)
  }
  async function handleAdopt() {
    const payload = situationMode === 'gacha'
      ? drawResult
      : { place: customPlace, time: customTime, text: customText }
    if (!payload?.text) return
    setProposing(true)
    await proposeAction(roomId, payload.place, payload.time, payload.text)
    setProposing(false)
    setSituationOpen(false)
  }
  async function handleRespond(decision) {
    setRespondPending(true)
    await respondAction(roomId, decision)
    setRespondPending(false)
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

  const isProposer = pendingSituation?.by === myUserId
  const hasPending = !!pendingSituation?.by

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, background: '#1c2133', zIndex: 90,
      display: 'flex', flexDirection: 'column',
      height: '100dvh',
      paddingBottom: keyboardOffset,
    }}>
      {showGachaTutorial && (
        <CoachMark
          steps={[
            { targetId: 'coach-ooc-gacha-btn', text: 'シチュエーションガチャです。結果を確認してから採用するか選べます。' },
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
          {messages && messages.map((msg, idx) => {
            const mine = msg.user_id === myUserId
            if (msg.is_system) {
              return <div key={msg.id} style={{ textAlign: 'center', fontSize: 11.5, color: '#8a92b5', whiteSpace: 'pre-wrap', fontFamily: "'Courier New', monospace", padding: '4px 0' }}>{msg.content}</div>
            }
            const prevMsg = messages[idx - 1]
            const showName = !prevMsg || prevMsg.is_system || prevMsg.user_id !== msg.user_id
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                {showName && <div style={{ fontSize: 10, color: '#7a82a0', marginBottom: 2, fontFamily: "'Courier New', monospace" }}>{msg.senderName}</div>}
                <div style={{ maxWidth: '75%', padding: msg.image_url ? 6 : '9px 13px', borderRadius: 3, fontSize: 14, lineHeight: 1.5, background: mine ? '#4a5580' : '#252b40', color: '#e8eaf5', border: '1px solid #3a4360' }}>
                  {msg.image_url && (
                    <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                      <img src={msg.image_url} alt="" style={{ display: 'block', maxWidth: '100%', maxHeight: 240, borderRadius: 2 }} />
                    </a>
                  )}
                  {msg.content && <div style={{ padding: msg.image_url ? '6px 4px 2px' : 0 }}>{msg.content}</div>}
                </div>
              </div>
            )
          })}
          <TypingDots names={typerNames} dark />
          <div id="ooc-bottom-anchor" />
        </div>
      </div>

      {hasPending && (
        <div style={{ flexShrink: 0, background: '#252b40', borderTop: '1px solid #4a5580', padding: '10px 16px' }}>
          <div style={{ fontSize: 9.5, color: '#7a82a0', marginBottom: 5, fontFamily: "'Courier New', monospace" }}>提案中のシチュエーション</div>
          <div style={{ fontSize: 11.5, color: '#e4e8f2', lineHeight: 1.6, marginBottom: 8 }}>
            {pendingSituation.place && pendingSituation.time ? `${pendingSituation.place}／${pendingSituation.time}` : (pendingSituation.place || pendingSituation.time)}
            {(pendingSituation.place || pendingSituation.time) && <br />}
            {pendingSituation.text}
          </div>
                    {isProposer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ fontSize: 10.5, color: '#8a92b5', fontStyle: 'italic', margin: 0 }}>相手の判断を待っています</p>
              <button
                type="button"
                disabled={respondPending}
                onClick={() => handleRespond('reject')}
                style={{
                  width: 18, height: 18, flexShrink: 0, borderRadius: '50%',
                  border: '1px solid #b8c0da', background: 'none', color: '#b8c0da',
                  fontSize: 11, fontWeight: 700, lineHeight: 1, padding: 0, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                aria-label="提案を取り消す"
              >
                ×
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" disabled={respondPending} onClick={() => handleRespond('reject')} style={{ flex: 1, padding: 8, background: 'none', border: '1px solid #5a6a8a', color: '#b8c0da', fontSize: 11.5, cursor: 'pointer' }}>不採用</button>
              <button type="button" disabled={respondPending} onClick={() => handleRespond('approve')} style={{ flex: 1, padding: 8, background: '#4a5580', border: 'none', color: '#e8eaf5', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>採用</button>
            </div>
          )}
        </div>
      )}

      <div style={{
        maxHeight: extrasOpen ? 60 : 0,
        opacity: extrasOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height .3s cubic-bezier(.4,0,.2,1), opacity .25s ease',
        flexShrink: 0, background: '#12151f',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 16px' }}>
          <button
            id="coach-ooc-gacha-btn"
            type="button"
            onClick={openGacha}
            style={{
              flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
              border: 'none', background: '#3d4d75', color: '#e8eaf5', fontSize: 15, cursor: 'pointer',
            }}
          >✨</button>
          <button
            type="button"
            onClick={openCustom}
            style={{
              flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
              border: 'none', background: '#2f3a5c', color: '#e8eaf5', fontSize: 15, cursor: 'pointer',
            }}
            aria-label="シチュエーションを自由記入"
          >✏️</button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
              border: 'none', background: '#2f3a5c', color: '#e8eaf5', fontSize: 15, cursor: 'pointer',
            }}
            aria-label="画像を添付"
          >📎</button>
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
        </div>
      </div>

      <form id="ooc-input-row" action={sendAction} onSubmit={handleFormSubmit} style={{
        flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 16px',
        background: '#12151f', borderTop: '1px solid #3a4360',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      }}>
        {imagePreview && (
          <div style={{ position: 'relative', width: 70 }}>
            <img src={imagePreview} alt="" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 4, border: '1px solid #3a4360' }} />
            <button type="button" onClick={clearImage} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', border: 'none', background: '#8a2418', color: '#fff', fontSize: 12, cursor: 'pointer' }}>×</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <input type="hidden" name="room_id" value={roomId} />
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
          <textarea
            ref={inputRef}
            name="content"
            rows={1}
            placeholder="中の人として発言"
            onFocus={() => setExtrasOpen(false)}
            onChange={() => sendTyping(myDisplayName)}
            onInput={autoResize}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, border: '1px solid #3a4360', borderRadius: 3, padding: '10px 12px', fontSize: 16,
              background: '#252b40', color: '#e8eaf5', fontFamily: "'Courier New', monospace",
              resize: 'none', overflowY: 'auto', lineHeight: '20px',
            }}
          />
          <SubmitBtn cooldown={cooldown || uploading} />
          <button
            type="button"
            onClick={() => setExtrasOpen((v) => !v)}
            aria-label="メニューの開閉"
            style={{
              flexShrink: 0, width: 28, height: 38, border: 'none', background: 'none',
              color: '#8a92b5', fontSize: 13, cursor: 'pointer',
              transition: 'transform .3s ease',
              transform: extrasOpen ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
          >
            ▼
          </button>
        </div>
      </form>

      {situationOpen && (
        <div onClick={() => setSituationOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#1c2133', border: '1px solid #3a4360', borderRadius: 4, padding: 18, maxWidth: 300, width: '90%' }}>
            {situationMode === 'gacha' ? (
              <div style={{ background: '#252b40', border: '1px solid #3a4360', padding: 14 }}>
                {drawing || !drawResult ? (
                  <p style={{ fontSize: 12, color: '#8a92b5', textAlign: 'center', padding: 20 }}>{drawing ? '抽選中…' : '結果がありません'}</p>
                ) : (
                  <>
                    <div style={{ fontSize: 10, color: '#7a82a0', marginBottom: 6, display: 'flex', gap: 8 }}>
                      <span>{drawResult.place}</span><span>・</span><span>{drawResult.time}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: '#e4e8f2', lineHeight: 1.7 }}>{drawResult.text}</div>
                  </>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                  <button type="button" disabled={drawing} onClick={handleDraw} style={{ flex: 1, padding: 9, background: 'none', border: '1px solid #5a6a8a', color: '#b8c0da', fontSize: 11.5, cursor: 'pointer' }}>もう一回</button>
                  <button type="button" disabled={drawing || proposing || !drawResult} onClick={handleAdopt} style={{ flex: 1, padding: 9, background: '#4a5580', border: 'none', color: '#e8eaf5', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>{proposing ? '…' : '採用'}</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 10.5, color: '#8a92b5', marginBottom: 5 }}>場所(任意)</div>
                <input value={customPlace} onChange={(e) => setCustomPlace(e.target.value)} placeholder="例:天文台" style={{ width: '100%', padding: 8, fontSize: 12.5, border: '1px solid #3a4360', background: '#252b40', color: '#e8eaf5', boxSizing: 'border-box' }} />
                <div style={{ fontSize: 10.5, color: '#8a92b5', margin: '10px 0 5px' }}>時間帯(任意)</div>
                <input value={customTime} onChange={(e) => setCustomTime(e.target.value)} placeholder="例:夜" style={{ width: '100%', padding: 8, fontSize: 12.5, border: '1px solid #3a4360', background: '#252b40', color: '#e8eaf5', boxSizing: 'border-box' }} />
                <div style={{ fontSize: 10.5, color: '#8a92b5', margin: '10px 0 5px' }}>シチュエーション</div>
                <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="自由に書いてください" style={{ width: '100%', minHeight: 70, padding: 8, fontSize: 12.5, border: '1px solid #3a4360', background: '#252b40', color: '#e8eaf5', resize: 'none', boxSizing: 'border-box' }} />
                <button type="button" disabled={proposing || !customText.trim()} onClick={handleAdopt} style={{ display: 'block', width: '100%', marginTop: 12, padding: 9, background: '#4a5580', border: 'none', color: '#e8eaf5', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>{proposing ? '…' : '採用'}</button>
              </div>
            )}
            <button type="button" onClick={() => setSituationOpen(false)} style={{ display: 'block', width: '100%', marginTop: 10, background: 'none', border: 'none', color: '#7a82a0', fontSize: 10.5, textDecoration: 'underline', cursor: 'pointer' }}>やっぱりやめておく</button>
          </div>
        </div>
      )}

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
