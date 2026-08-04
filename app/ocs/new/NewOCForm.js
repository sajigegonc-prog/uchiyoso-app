'use client'
import { useState } from 'react'
import { lightFieldLabelStyle, lightInputStyle, lightBtnStyle } from '../styles'
import SubmitButton from '@/components/SubmitButton'
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
function daysInMonth(year, month) {
  if (!year || !month) return 31
  return new Date(year, month, 0).getDate()
}
export default function NewOCForm({ action }) {
  const [ocType, setOcType] = useState('creation')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const birthDate = year && month && day
    ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    : ''
  const days = Array.from({ length: daysInMonth(Number(year), Number(month)) }, (_, i) => i + 1)
  const selectStyle = { ...lightInputStyle, minWidth: 0 }
  return (
    <form action={action} style={{ width: '100%', maxWidth: 360, textAlign: 'left', marginTop: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <label style={lightFieldLabelStyle}>キャラクター名</label>
        <input name="name" placeholder="例:ミラ・トウドウ" style={lightInputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={lightFieldLabelStyle}>タイプ</label>
        <select
          name="oc_type"
          style={lightInputStyle}
          value={ocType}
          onChange={(e) => setOcType(e.target.value)}
        >
          <option value="creation">創作キャラ</option>
          <option value="dreamer">夢主</option>
        </select>
      </div>
      {ocType === 'dreamer' && (
        <div style={{ marginBottom: 14 }}>
          <label style={lightFieldLabelStyle}>お相手(必須)</label>
          <input name="paired_character" placeholder="例:フレッド・ウィーズリー" style={lightInputStyle} />
          <p style={{ fontSize: 11.5, color: '#8b7355', marginTop: 6, lineHeight: 1.6 }}>
            ランダムマッチングで同担のお相手を避けるために使われます。正確にご記入ください。
          </p>
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <label style={lightFieldLabelStyle}>寮</label>
        <input name="house" placeholder="例:ハッフルパフ" style={lightInputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={lightFieldLabelStyle}>生年月日</label>
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
        <label style={lightFieldLabelStyle}>設定・紹介文</label>
        <textarea name="description" placeholder="性格や特徴など自由にどうぞ" style={{ ...lightInputStyle, minHeight: 80, resize: 'none' }} />
      </div>
      <SubmitButton style={lightBtnStyle} pendingText="登録中…">登録する</SubmitButton>
    </form>
  )
}
