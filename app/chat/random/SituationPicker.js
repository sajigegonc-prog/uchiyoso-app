'use client'
import { useState } from 'react'

export default function SituationPicker({ myOcId, friendOcId, gachaPick, noteExamples, confirmAction }) {
  const [mode, setMode] = useState('gacha')
  const [customPlace, setCustomPlace] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [customText, setCustomText] = useState('')

  const tabStyle = (active) => ({
    flex: 1, textAlign: 'center', padding: 8, fontSize: 11.5, cursor: 'pointer',
    background: active ? '#211d17' : '#fff', color: active ? '#f4eee0' : '#6b6250', fontWeight: active ? 700 : 400,
  })

  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <div style={{ display: 'flex', border: '1px solid #211d17', marginTop: 16, marginBottom: 12 }}>
        <div style={tabStyle(mode === 'gacha')} onClick={() => setMode('gacha')}>ガチャで決める</div>
        <div style={tabStyle(mode === 'custom')} onClick={() => setMode('custom')}>自分で入力する</div>
      </div>

      {mode === 'gacha' ? (
        <div style={{ width: '100%', border: '4px double #211d17', padding: 18, textAlign: 'center', background: '#fff' }}>
          <div style={{ fontSize: 10.5, color: '#8a8168' }}>{gachaPick.place}／{gachaPick.time}</div>
          <div style={{ fontSize: 12.5, color: '#211d17', marginTop: 8, lineHeight: 1.8 }}>{gachaPick.text}</div>
        </div>
      ) : (
        <div>
          <label style={{ fontSize: 11, color: '#6b6250', display: 'block', marginBottom: 5 }}>場所(任意)</label>
          <input value={customPlace} onChange={(e) => setCustomPlace(e.target.value)} placeholder="例:天文台"
            style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: '1px solid #211d17', background: '#fff', color: '#211d17', boxSizing: 'border-box' }} />
          <label style={{ fontSize: 11, color: '#6b6250', display: 'block', margin: '10px 0 5px' }}>時間帯(任意)</label>
          <input value={customTime} onChange={(e) => setCustomTime(e.target.value)} placeholder="例:夜"
            style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: '1px solid #211d17', background: '#fff', color: '#211d17', boxSizing: 'border-box' }} />
          <label style={{ fontSize: 11, color: '#6b6250', display: 'block', margin: '10px 0 5px' }}>シチュエーション</label>
          <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="自由に書いてください"
            style={{ width: '100%', minHeight: 70, padding: '9px 11px', fontSize: 13, border: '1px solid #211d17', background: '#fff', color: '#211d17', resize: 'none', boxSizing: 'border-box' }} />
        </div>
      )}

      <form action={confirmAction} style={{ marginTop: 16 }}>
        <input type="hidden" name="my_oc_id" value={myOcId} />
        <input type="hidden" name="friend_oc_id" value={friendOcId} />
        <input type="hidden" name="location" value={mode === 'gacha' ? gachaPick.place : customPlace} />
        <input type="hidden" name="time_period" value={mode === 'gacha' ? gachaPick.time : customTime} />
        <input type="hidden" name="situation_text" value={mode === 'gacha' ? gachaPick.text : customText} />
        <button
          type="button"
          onClick={() => setNoteOpen((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
            background: 'none', border: 'none', padding: 0, marginTop: 4, cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 11, color: '#6b6250' }}>一言メモ(任意)</span>
          <span style={{ fontSize: 12, color: '#8a8168' }}>{noteOpen ? '︿ 閉じる' : '﹀ 開く'}</span>
        </button>
        {noteOpen && (
          <>
            <textarea name="note" placeholder="お相手への一言があれば書いてください"
              style={{ width: '100%', minHeight: 56, padding: 10, fontSize: 12.5, border: '1px solid #211d17', background: '#fff', color: '#211d17', resize: 'none', boxSizing: 'border-box', marginTop: 5, fontFamily: "'BIZ UDPGothic', sans-serif" }} />
            <p style={{ fontSize: 10, color: '#8a8168', marginTop: 6, marginBottom: 4, lineHeight: 1.7, fontStyle: 'italic' }}>
              {noteExamples.map((ex, i) => <span key={i}>例: {ex}<br /></span>)}
            </p>
          </>
        )}
        <button type="submit" disabled={mode === 'custom' && !customText.trim()}
          style={{ width: '100%', padding: 13, background: '#211d17', color: '#f4eee0', border: 'none', fontWeight: 700, fontSize: 13, marginTop: 10 }}>
          このお部屋を作る
        </button>
      </form>
    </div>
  )
}
