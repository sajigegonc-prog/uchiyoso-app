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

export default function NewRoomForm({ action, ocs, friendOcs, initialFriendOcId }) {
  const [step, setStep] = useState(1)
  const [selfPlay, setSelfPlay] = useState(false)
  const [speakerOcId, setSpeakerOcId] = useState(ocs[0]?.id || '')
  const [checkedFriendOcIds, setCheckedFriendOcIds] = useState(initialFriendOcId ? [initialFriendOcId] : [])
  const submittingRef = useRef(false)

  const secStyle = (visible) => ({ display: visible ? 'block' : 'none' })
  const otherOcs = ocs.filter((oc) => oc.id !== speakerOcId)

  const groups = []
  const seenFriend = new Set()
  for (const f of friendOcs) {
    if (!seenFriend.has(f.friend_user_id)) {
      seenFriend.add(f.friend_user_id)
      groups.push({ label: f.friend_display_name || '名前未設定', ocs: friendOcs.filter((x) => x.friend_user_id === f.friend_user_id) })
    }
  }

  function toggleFriendOc(ocId) {
    setCheckedFriendOcIds((prev) => prev.includes(ocId) ? prev.filter((id) => id !== ocId) : [...prev, ocId])
  }

  function handleSubmit(e) {
    if (submittingRef.current) { e.preventDefault(); return }
    submittingRef.current = true
  }

  return (
    <form action={action} onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 360, marginTop: 16 }}>
      <input type="hidden" name="oc_id" value={speakerOcId} />
      {checkedFriendOcIds.map((id) => (
        <input key={id} type="hidden" name="friend_oc_ids" value={id} />
      ))}
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
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#211d17', fontWeight: 700, marginTop: 14 }}>
          <input type="checkbox" checked={selfPlay} onChange={(e) => setSelfPlay(e.target.checked)} style={{ width: 16, height: 16 }} />
          うちの子同士で会話する
        </label>
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

        {selfPlay && (
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
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>招待する友達のOC(複数選択可)</label>
          {groups.length === 0 && <p style={{ fontSize: 12.5, color: '#8a8168', fontStyle: 'italic' }}>まだ友達がいません。</p>}
          {groups.map((g) => (
            <div key={g.label} style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10.5, color: '#6b6250', fontStyle: 'italic', marginBottom: 6 }}>{g.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {g.ocs.map((oc) => (
                  <label key={oc.oc_id} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', cursor: 'pointer',
                    border: checkedFriendOcIds.includes(oc.oc_id) ? '1px solid #211d17' : '1px solid #8a8168',
                    background: checkedFriendOcIds.includes(oc.oc_id) ? '#fff' : '#f4eee0',
                    fontSize: 12.5, color: '#211d17',
                  }}>
                    <input
                      type="checkbox"
                      checked={checkedFriendOcIds.includes(oc.oc_id)}
                      onChange={() => toggleFriendOc(oc.oc_id)}
                      style={{ width: 14, height: 14 }}
                    />
                    {oc.oc_name}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <p style={{ fontSize: 11, color: '#8a8168', marginTop: 10, lineHeight: 1.7, fontStyle: 'italic' }}>
            招待すると相手に通知が届き、相手が承認するとチャットに参加します。複数選ぶとグループチャットになります。
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
          <button type="button" style={btnGhostStyle} onClick={() => setStep(1)}>戻る</button>
          <button type="submit" style={btnStyle}>この内容で作成する</button>
        </div>
      </div>
    </form>
  )
}
