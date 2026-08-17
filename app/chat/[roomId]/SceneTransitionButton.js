'use client'
import { useState, useEffect } from 'react'
import { requestSceneTransition, approveSceneTransition } from './transitionActions'

export default function SceneTransitionButton({ roomId, pending, alreadyApproved, requestedByName, hasUnread }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [transcript, setTranscript] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (transcript !== null) {
      document.body.dataset.suppressRefresh = 'true'
    } else {
      delete document.body.dataset.suppressRefresh
    }
    return () => {
      delete document.body.dataset.suppressRefresh
    }
  }, [transcript])

  async function handleStart() {
    setBusy(true)
    const result = await requestSceneTransition(roomId)
    setBusy(false)
    setConfirming(false)
    setTranscript(result.transcript)
    setCompleted(result.completed)
  }

  async function handleApprove() {
    setBusy(true)
    const result = await approveSceneTransition(roomId)
    setBusy(false)
    setTranscript(result.transcript)
    setCompleted(result.completed)
  }

  function handleCopy() {
    navigator.clipboard.writeText(transcript || '')
    setCopied(true)
  }

  if (transcript !== null) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(33,29,23,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
        <div style={{ background: '#f4eee0', border: '1px solid #211d17', padding: 20, maxWidth: 340, width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif' }}>
              {completed ? '場面転換が完了しました' : 'ログをコピーしてください'}
            </div>
            <p style={{ fontSize: 11, color: '#8a2418', marginTop: 8, lineHeight: 1.7 }}>
              このログはこの場でのみ表示され、データベースには保存されません。再発行はできませんので、必ずコピーして保存してください。
            </p>
            <p style={{ fontSize: 10.5, color: '#6b6250', marginTop: 6, lineHeight: 1.7, fontStyle: 'italic' }}>
              ホーム画面の「過去のおしゃべりを思い出す」に貼ると、いつでも見返せます。★の付いた発言があなたのキャラです。
            </p>
          <textarea
            readOnly
            value={transcript}
            style={{ marginTop: 10, flex: 1, minHeight: 160, fontSize: 12, padding: 10, border: '1px solid #8a8168', background: '#fff', color: '#211d17', resize: 'none' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" onClick={handleCopy} style={{ flex: 1, padding: 10, border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
              {copied ? 'コピーしました' : 'コピーする'}
            </button>
            <button type="button" onClick={() => setTranscript(null)} style={{ flex: 1, padding: 10, border: '1px solid #8a8168', background: '#fff', color: '#6b6250', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
              閉じる
            </button>
          </div>
          {!completed && (
            <p style={{ fontSize: 10.5, color: '#8a8168', marginTop: 10, fontStyle: 'italic' }}>他のメンバーの承諾を待っています。</p>
          )}
        </div>
      </div>
    )
  }

    if (pending) {
    if (alreadyApproved) {
      return (
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10,
          height: 36, padding: '0 10px 0 16px', borderRadius: 4,
          background: '#d8cdb0', border: '1px solid #8a8168', color: '#6b6250', fontSize: 12.5, whiteSpace: 'nowrap',
        }}>
          場面転換：承諾待ち…
        </div>
      )
    }
    return (
          return (
      <button type="button" onClick={handleApprove} disabled={busy}
        style={{ flexShrink: 0, padding: '0 16px', height: 36, background: '#211d17', border: '1px solid #211d17', color: '#f4eee0', fontSize: 12.5, fontWeight: 700, borderRadius: 4, cursor: 'pointer' }}>
        {busy ? '処理中…' : '場面転換に承諾する'}
      </button>
    )
  }

  return (
    <>
      <button id="coach-scene-btn" type="button" onClick={() => setConfirming(true)}
        style={{ position: 'relative', flexShrink: 0, fontSize: 12.5, color: '#211d17', background: '#fff', border: '1px solid #211d17', borderRadius: 4, padding: '0 14px', height: 36, cursor: 'pointer' }}>
        場面転換
        {hasUnread && (
          <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#8a2418', border: '1px solid #f4eee0' }} />
        )}
      </button>
      {confirming && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(33,29,23,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div style={{ background: '#f4eee0', border: '1px solid #211d17', padding: 20, maxWidth: 300, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#211d17', lineHeight: 1.8 }}>この場面を終わりますか？<br />これまでのログはリセットされます。</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="button" onClick={() => setConfirming(false)} style={{ flex: 1, padding: 9, border: '1px solid #8a8168', background: '#fff', color: '#6b6250', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>キャンセル</button>
              <button type="button" onClick={handleStart} disabled={busy} style={{ flex: 1, padding: 9, border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                {busy ? '処理中…' : 'はい'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
