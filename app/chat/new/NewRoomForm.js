'use client'
import { useState } from 'react'
import { lightFieldLabelStyle, lightInputStyle, lightBtnStyle } from '../../ocs/styles'
import SubmitButton from '@/components/SubmitButton'

const stepTitles = {
  1: '誰が話しますか?',
  2: '部屋の情報',
  3: 'お相手を選ぶ',
}

export default function NewRoomForm({ action, ocs, friends }) {
  const [step, setStep] = useState(1)
  const [selfPlay, setSelfPlay] = useState(false)
  const [speakerOcId, setSpeakerOcId] = useState(ocs[0]?.id || '')

  const secStyle = (visible) => ({ display: visible ? 'block' : 'none' })
  const otherOcs = ocs.filter((oc) => oc.id !== speakerOcId)

  return (
    <form action={action} style={{ width: '100%', maxWidth: 360, marginTop: 16 }}>
      <div style={{ fontSize: 12.5, color: '#8b5a2b', fontWeight: 700, marginBottom: 10 }}>
        {step} / 3 ・ {stepTitles[step]}
      </div>

      {/* Step 1: 話すOCを選ぶ */}
      <div style={secStyle(step === 1)}>
        <div style={{ marginBottom: 14 }}>
          <label style={lightFieldLabelStyle}>あなたのOC</label>
          <select
            name="oc_id"
            style={lightInputStyle}
            value={speakerOcId}
            onChange={(e) => setSpeakerOcId(e.target.value)}
          >
            {ocs.map((oc) => (
              <option key={oc.id} value={oc.id}>{oc.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" style={lightBtnStyle} onClick={() => setStep(2)}>次へ</button>
        </div>
      </div>

      {/* Step 2: 部屋の情報 */}
      <div style={secStyle(step === 2)}>
        <div style={{ marginBottom: 14 }}>
          <label style={lightFieldLabelStyle}>部屋名</label>
          <input name="name" placeholder="例:図書室の隔っこ" style={lightInputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lightFieldLabelStyle}>場所</label>
          <input name="location" placeholder="例:図書室3階" style={lightInputStyle} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#5c3a21', fontWeight: 700 }}>
          <input
            type="checkbox"
            name="self_play"
            checked={selfPlay}
            onChange={(e) => setSelfPlay(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          うちの子同士で会話する
        </label>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <button type="button" style={{ ...lightBtnStyle, background: '#fbf5e9', color: '#8b7355', boxShadow: 'none' }} onClick={() => setStep(1)}>戻る</button>
          <button type="button" style={lightBtnStyle} onClick={() => setStep(3)}>次へ</button>
        </div>
      </div>

      {/* Step 3: 自分の別OC or フレンド招待 */}
      <div style={secStyle(step === 3)}>
        {selfPlay ? (
          <div style={{ marginBottom: 14 }}>
            <label style={lightFieldLabelStyle}>一緒に参加させるOC</label>
            {otherOcs.length === 0 && (
              <p style={{ fontSize: 12.5, color: '#8b7355' }}>他に登録済みのOCがありません。</p>
            )}
            {otherOcs.map((oc) => (
              <label key={oc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#241a10', marginTop: 8 }}>
                <input type="checkbox" name="extra_oc_ids" value={oc.id} style={{ width: 16, height: 16 }} />
                {oc.name}
              </label>
            ))}
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
          <button type="button" style={{ ...lightBtnStyle, background: '#fbf5e9', color: '#8b7355', boxShadow: 'none' }} onClick={() => setStep(2)}>戻る</button>
          <SubmitButton style={lightBtnStyle} pendingText="作成中…">この内容で作成する</SubmitButton>
        </div>
      </div>
    </form>
  )
}
