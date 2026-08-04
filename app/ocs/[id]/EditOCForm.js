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

export default function EditOCForm({ oc, action }) {
  const [ocType, setOcType] = useState(oc.oc_type || 'creation')
  const initial = oc.birth_date ? oc.birth_date.split('-') : ['', '', '']
  const [year, setYear] = useState(initial[0] || '')
  const [month, setMonth] = useState(initial[1] ? String(Number(initial[1])) : '')
  const [day, setDay] = useState(initial[2] ? String(Number(initial[2])) : '')
  const birthDate = year && month && day
    ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    : ''
  const days = Array.from({ length: daysInMonth(Number(year), Number(month)) }, (_, i) => i + 1)
  const selectStyle = { ...lightInputStyle, minWidth: 0 }

  return (
    <form action={action} style={{ width: '100%', textAlign: 'left', marginTop: 8 }}>
      <input type="hidden" name="id" value={oc.id} />
      <div style={{ marginBottom: 14 }}>
        <label style={lightFieldLabelStyle}>キャラクター名</label>
        <input name="name" defaultValue={oc.name} style={lightInputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={lightFieldLabelStyle}>タイプ</label>
        <select name="oc_type" style={lightInputStyle} value={ocType} onChange={(e) => setOcType(e.target.value)}>
          <option value="creation">創作キャラ</option>
          <option value="dreamer">夢主</option>
        </select>
      </div>
      {ocType === 'dreamer' && (
        <div style={{ marginBottom: 14 }}>
          <label style={lightFieldLabelStyle}>お相手(必須)</label>
          <input name="paired_character" defaultValue={oc.paired_character || ''} style={lightInputStyle} />
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <label style={lightFieldLabelStyle}>寮・職業</label>
        <input name="house" defaultValue={oc.house || ''} style={lightInputStyle} />
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
        <textarea name="description" defaultValue={oc.description || ''} style={{ ...lightInputStyle, minHeight: 80, resize: 'none' }} />
      </div>
      <SubmitButton style={lightBtnStyle} pendingText="保存中…">保存する</SubmitButton>
    </form>
  )
}
