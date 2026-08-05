'use client'
import { useState, useRef } from 'react'

const stepTitles = { 1: '誰が話しますか?', 2: 'お相手を選ぶ' }

const labelStyle = { fontSize: 11, color: '#6b6250', display: 'block', marginBottom: 5, letterSpacing: '.05em' }
const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 15,
  background: '#fff', border: '1px solid #211d17', color: '#211d17',
  boxSizing: 'border-box', fontFamily: "'BIZ UDPGothic', sans-serif",
}
const btnStyle = {
  padding: '11px 20px', border: '1px solid #211d17',
  fontSize: 14, fontWeight: 700, cursor: 'pointer',
  background: '#211d17', color: '#f4eee0', letterSpacing: '.05em',
}
const btnGhostStyle = { ...btnStyle, background: '#fff', color: '#6b6250', border: '1px solid #8a8168' }

export default function NewRoomForm({ action, ocs, friends, initialFriendId, initialFriendName }) {
  const [step, setStep] = useState(1)
  const [selfPlay, setSelfPlay] = useState(false)
  const [speakerOcId, setSpeakerOcId] = useState(ocs[0]?.id || '')
  const submittingRef = useRef(false)

  const secStyle = (visible) => ({ display: visible ? 'block' : 'none' })
  const otherOcs = ocs.filter((oc) => oc.id !== speakerOcId)

  function handleSubmit(e) {
    if (submittingRef.current) { e.preventDefault(); return }
    submittingRef.current = true
  }

  return (
    <form action={action} onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 360, marginTop: 16 }}>
      <input type="hidden" name="oc_id" value={speakerOcId} />
      <div style={{ fontSize: 11, color: '#6b6250', fontWeight: 700, marginBottom: 12, letterSpacing: '.1em' }}>
        {step} / 2 ・ {stepTitles[step]}
      </div>

      <div style={secStyle(step === 1)}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          {ocs.map((oc) => (
            <button key={oc.id} type="button" onClick={() => setSpeakerOcId(oc.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                width: 76, padding: '10px 6px', cursor: 'pointer',
                border: speakerOcId === oc.id ? '1px solid #211d17' : '1px solid #8a8168',
                background: speakerOcId === oc.id ? '#fff' : '#f4eee0',
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
                background: '#211d17', border: '1px solid #211d17',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#f4eee0', fontWeight: 700, fontSize: 15, fontFamily: 'Georgia, serif',
              }}>
                {oc.icon_url ? <img src={oc.icon_url} alt={oc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : oc.name?.charAt(0)}
              </div>
              <span style={{ fontSize: 11, color: '#211d17', textAlign: 'center', lineHeight: 1.3 }}>{oc.name}</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#8a8168', lineHeight: 1.7, fontStyle: 'italic' }}>
          チャット内でいつでも他の子に切り替えることができます。
        </p>
        {!initialFriendId && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#211d17', fontWeight: 700, marginTop: 14 }}>
            <input type="checkbox" name="self_play" checked={selfPlay} onChange={(e) => setSelfPlay(e.target.checked)} style={{ width: 16, height: 16 }} />
            うちの子同士で会話する
          </label>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" style={btnStyle} onClick={() => setStep(2)} disabled={!speakerOcId}>次へ</button>
        </div>
      </div>

      <div style={secStyle(step === 2)}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>場所(任意)</label>
          <input name="location" placeholder="例:図書室3階" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>時間帯(任意)</label>
          <input name="time_period" placeholder="例:放課後、夜" style={inputStyle} />
        </div>

        {initialFriendId ? (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>友達</label>
            <input type="hidden" name="friend_id" value={initialFriendId} />
            <div style={{ fontSize: 14, color: '#211d17', padding: '10px 12px', border: '1px solid #211d17', background: '#fff' }}>
              {initialFriendName || '名前未設定'} さんを招待します
            </div>
          </div>
        ) : selfPlay ? (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>一緒に参加させるOC</label>
            {otherOcs.length === 0 && <p style={{ fontSize: 12.5, color: '#8a8168', fontStyle: 'italic' }}>他に登録済みのOCがありません。</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
              {otherOcs.map((oc) => (
                <label key={oc.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 76, padding: '10px 6px', cursor: 'pointer', border: '1px solid #8a8168', background: '#fff' }}>
                  <input type="checkbox" name="extra_oc_ids" value={oc.id} style={{ width: 16, height: 16 }} />
                  <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: '#211d17', border: '1px solid #211d17', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f4eee0', fontWeight: 700, fontSize: 13, fontFamily: 'Georgia, serif' }}>
                    {oc.icon_url ? <img src={oc.icon_url} alt={oc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : oc.name?.charAt(0)}
                  </div>
                  <span style={{ fontSize: 10.5, color: '#211d17', textAlign: 'center', lineHeight: 1.3 }}>{oc.name}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>友達</label>
            {friends.length === 0 && <p style={{ fontSize: 12.5, color: '#8a8168', fontStyle: 'italic' }}>まだ友達がいません。</p>}
            {friends.length > 0 && (
              <select name="friend_id" style={inputStyle} defaultValue="">
                <option value="" disabled>選んでください</option>
                {friends.map((f) => <option key={f.id} value={f.id}>{f.display_name || '名前未設定'}</option>)}
              </select>
            )}
            <p style={{ fontSize: 11, color: '#8a8168', marginTop: 6, lineHeight: 1.7, fontStyle: 'italic' }}>
              招待すると相手に通知が届き、相手が承認するとチャットに参加します。
            </p>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
          <button type="button" style={btnGhostStyle} onClick={() => setStep(1)}>戻る</button>
          <button type="submit" style={btnStyle}>この内容で作成する</button>
        </div>
      </div>
    </form>
  )
}
