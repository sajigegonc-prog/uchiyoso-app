'use client'
import { useState } from 'react'

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

export default function NameChangeForm({ action, currentName }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData) {
    setPending(true)
    setError(null)
    const result = await action(formData)
    setPending(false)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(true)
    }
  }

  return (
    <form action={handleSubmit} style={{ marginTop: 16 }}>
      <label style={labelStyle}>表示名</label>
      <input name="display_name" defaultValue={currentName} style={inputStyle} />
      {error && <p style={{ fontSize: 12, color: '#8a2418', marginTop: 10, lineHeight: 1.7 }}>{error}</p>}
      {success && <p style={{ fontSize: 12, color: '#3d5c33', marginTop: 10 }}>変更しました。</p>}
      <button type="submit" disabled={pending} style={btnStyle}>
        {pending ? '変更中…' : '変更する'}
      </button>
      <p style={{ fontSize: 10.5, color: '#8a8168', marginTop: 10, fontStyle: 'italic' }}>
        変更は30日に1回までです。
      </p>
    </form>
  )
}
