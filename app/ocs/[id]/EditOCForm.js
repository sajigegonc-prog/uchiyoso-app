'use client'
import { useState } from 'react'
import SubmitButton from '@/components/SubmitButton'

const currentYear = new Date().getFullYear()
const HOUSES = ['グリフィンドール', 'ハッフルパフ', 'レイブンクロー', 'スリザリン']
const years = Array.from({ length: 300 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
function daysInMonth(year, month) {
  if (!year || !month) return 31
  return new Date(year, month, 0).getDate()
}

const labelStyle = { fontSize: 11, color: '#6b6250', display: 'block', marginBottom: 5, letterSpacing: '.05em' }
const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 15,
  background: '#fff', border: '1px solid #211d17', color: '#211d17',
  boxSizing: 'border-box', fontFamily: "'BIZ UDPGothic', sans-serif",
}
const btnStyle = {
  width: '100%', padding: 12, border: '1px solid #211d17',
  fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 18,
  background: '#211d17', color: '#f4eee0', letterSpacing: '.05em',
}

export default function EditOCForm({ oc, action }) {
  const [ocType, setOcType] = useState(oc.oc_type || 'creation')
  const initialHouse = HOUSES.includes(oc.house) ? oc.house : (oc.house ? 'その他' : '')
  const [house, setHouse] = useState(initialHouse)
  const [eraFocus, setEraFocus] = useState(oc.era_focus || 'student')
  const [customHouse, setCustomHouse] = useState(initialHouse === 'その他' ? oc.house : '')
  const initial = oc.birth_date ? oc.birth_date.split('-') : ['', '', '']
  const [year, setYear] = useState(initial[0] || '')
  const [month, setMonth] = useState(initial[1] ? String(Number(initial[1])) : '')
  const [day, setDay] = useState(initial[2] ? String(Number(initial[2])) : '')
  const birthDate = year && month && day
    ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    : ''
  const days = Array.from({ length: daysInMonth(Number(year), Number(month)) }, (_, i) => i + 1)
  const selectStyle = { ...inputStyle, minWidth: 0 }

  return (
    <form action={action} style={{ width: '100%', textAlign: 'left', marginTop: 12 }}>
      <input type="hidden" name="id" value={oc.id} />
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>キャラクター名</label>
        <input name="name" defaultValue={oc.name} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>タイプ</label>
        <select name="oc_type" style={inputStyle} value={ocType} onChange={(e) => setOcType(e.target.value)}>
          <option value="creation">創作キャラ</option>
          <option value="dreamer">夢主</option>
        </select>
      </div>
      {ocType === 'dreamer' && (
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>お相手(必須)</label>
          <input name="paired_character" defaultValue={oc.paired_character || ''} style={inputStyle} />
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>寮</label>
        <select value={house} onChange={(e) => setHouse(e.target.value)} style={inputStyle}>
          <option value="">選んでください</option>
          {HOUSES.map((h) => <option key={h} value={h}>{h}</option>)}
          <option value="その他">その他(自由記入)</option>
        </select>
        {house === 'その他' && (
          <input
            value={customHouse}
            onChange={(e) => setCustomHouse(e.target.value)}
            placeholder="例:魔法史担当教授"
            style={{ ...inputStyle, marginTop: 8 }}
          />
        )}
        <input type="hidden" name="house" value={house === 'その他' ? customHouse : house} />
      </div>
      <div style={{ marginBottom: 14 }}>
         <label style={labelStyle}>卒業後の進路(任意)</label>
        <input name="career" defaultValue={oc.career || ''} style={inputStyle} />
          </div>
                    <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>メインで活動する時代</label>
            <div style={{ display: 'flex', border: '1px solid #211d17' }}>
              <div
                onClick={() => setEraFocus('student')}
                style={{
                  flex: 1, textAlign: 'center', padding: '10px 6px', fontSize: 12, cursor: 'pointer',
                  background: eraFocus === 'student' ? '#211d17' : '#fff',
                  color: eraFocus === 'student' ? '#f4eee0' : '#6b6250',
                  fontWeight: eraFocus === 'student' ? 700 : 400,
                }}
              >
                在学中メイン
              </div>
              <div
                onClick={() => setEraFocus('career')}
                style={{
                  flex: 1, textAlign: 'center', padding: '10px 6px', fontSize: 12, cursor: 'pointer',
                  background: eraFocus === 'career' ? '#211d17' : '#fff',
                  color: eraFocus === 'career' ? '#f4eee0' : '#6b6250',
                  fontWeight: eraFocus === 'career' ? 700 : 400,
                }}
              >
                卒業後メイン
              </div>
            </div>
            <p style={{ fontSize: 10, color: '#8a8168', marginTop: 6, lineHeight: 1.6, fontStyle: 'italic' }}>
              選んだ方が一覧で先に表示されます(いつでも切り替え可能です)
            </p>
            <input type="hidden" name="era_focus" value={eraFocus} />
          </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>生年月日</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <select style={{ ...selectStyle, flex: 1.3 }} value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">年</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select style={{ ...selectStyle, flex: 1 }} value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">月</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select style={{ ...selectStyle, flex: 1 }} value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="">日</option>
            {days.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <input type="hidden" name="birth_date" value={birthDate} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>設定・紹介文</label>
        <textarea name="description" defaultValue={oc.description || ''} style={{ ...inputStyle, minHeight: 80, resize: 'none' }} />
      </div>
      <SubmitButton style={btnStyle} pendingText="保存中…">保存する</SubmitButton>
    </form>
  )
}
