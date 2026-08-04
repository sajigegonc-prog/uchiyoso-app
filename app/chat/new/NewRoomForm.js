'use client'
import { useState } from 'react'
import { lightFieldLabelStyle, lightInputStyle, lightBtnStyle } from '../../ocs/styles'
import Avatar from '@/components/Avatar'
import SubmitButton from '@/components/SubmitButton'

const stepTitles = {
  1: '誰が話しますか?',
  2: 'お相手を選ぶ',
}

export default function NewRoomForm({ action, ocs, friends }) {
  const [step, setStep] = useState(1)
  const [selfPlay, setSelfPlay] = useState(false)
  const [speakerOcId, setSpeakerOcId] = useState(ocs[0]?.id || '')

  const secStyle = (visible) => ({ display: visible ? 'block' : 'none' })
  const otherOcs = ocs.filter((oc) => oc.id !== speakerOcId)
  const speakerOc = ocs.find((oc) => oc.id === speakerOcId)

  return (
    <form action={action} style={{ width: '100%', maxWidth: 360, marginTop: 16 }}>
      <input type="hidden" name="oc_id" value={speakerOcId} />
      <div style={{ fontSize: 12.5, color: '#8b5a2b', fontWeight: 700, marginBottom: 10 }}>
        {step} / 2 ・ {stepTitles[step]}
      </div>

      {/* Step 1: 話すOCを選ぶ */}
      <div style={secStyle(step === 1)}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          {ocs.map((oc) => (
            <button
              key={oc.id}
              type="button"
              onClick={() => setSpeakerOcId(oc.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                width: 76, padding: '10px 6px', borderRadius: 3, cursor: 'pointer',
                border: speakerOcId === oc.id ? '2px solid #8b5a2b' : '2px solid #d8c7ac',
                background: speakerOcId === oc.id ? '#fbf5e9' : '#fff',
              }}
            >
              <Avatar name={oc.name} iconUrl={oc.icon_url} size={44} />
              <span style={{ fontSize: 11.5, color: '#241a10', textAlign: 'center', lineHeight: 1.3 }}>{oc.name}</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11.5, color: '#8b7355', lineHeight: 1.6 }}>
          チャット内でいつでも他の子に切り替えることができます。
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#5c3a21', fontWeight: 700, marginTop: 14 }}>
          <input
            type="checkbox"
            name="self_play"
            checked={selfPlay}
            onChange={(e) => setSelfPlay(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          うちの子同士で会話する
        </label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button type="button" style={lightBtnStyle} onClick={() => setStep(2)} disabled={!speakerOcId}>次へ</button>
        </div>
      </div>

      {/* Step 2: 自分の別OC or フレンド招待 */}
      <div style={secStyle(step === 2)}>
        {selfPlay ? (
          <div style={{ marginBottom: 14 }}>
            <label style={lightFieldLabelStyle}>一緒に参加させるOC</label>
            {otherOcs.length === 0 && (
              <p style={{ fontSize: 12.5, color: '#8b7355' }}>他に登録済みのOCがありません。</p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
              {otherOcs.map((oc) => (
                <label
                  key={oc.id}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    width: 76, padding: '10px 6px', borderRadius: 3, cursor: 'pointer',
                    border: '2px solid #d8c7ac', background: '#fff',
                  }}
                >
                  <input type="checkbox" name="extra_oc_ids" value={oc.id} style={{ width: 16, height: 16 }} />
                  <Avatar name={oc.name} iconUrl={oc.icon_url} size={40} />
                  <span style={{ fontSize: 11, color: '#241a10', textAlign: 'center', lineHeight: 1.3 }}>{oc.name}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <label style={lightFieldLabelStyle}>招待するフレンド</label>
            {friends.length === 0 && (
              <p style={{ fontSize: 12.5, color: '#8b7355' }}>
                まだフレンドがいません。先にフレンド機能から招待リンクを送ってください。
              </p>
            )}
            {friends.length > 0 && (
              <select name="friend_id" style={lightInputStyle} defaultValue="">
                <option value="" disabled>選んでください</option>
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>{f.display_name || '名前未設定'}</option>
                ))}
              </select>
            )}
            <p style={{ fontSize: 11.5, color: '#8b7355', marginTop: 6, lineHeight: 1.6 }}>
              招待すると相手に通知が届き、相手が承認するとチャットに参加します。
            </p>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <button type="button" style={{ ...lightBtnStyle, background: '#fbf5e9', color: '#8b7355', boxShadow: 'none' }} onClick={() => setStep(1)}>戻る</button>
          <SubmitButton style={lightBtnStyle} pendingText="作成中…">この内容で作成する</SubmitButton>
        </div>
      </div>
    </form>
  )
}
