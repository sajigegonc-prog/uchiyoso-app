'use client'
import { useState, useTransition } from 'react'

export default function DisplayNameForm({ action, currentName }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  function handleSubmit(formData) {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  return (
    <form action={handleSubmit} style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          name="display_name"
          defaultValue={currentName}
          style={{ flex: 1, padding: '10px 12px', fontSize: 14, background: '#fff', border: '1px solid #211d17', color: '#211d17' }}
        />
        <button type="submit" disabled={isPending} style={{ flexShrink: 0, padding: '10px 14px', border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
          {isPending ? '…' : saved ? '✓' : '保存'}
        </button>
      </div>
      {error && <p style={{ fontSize: 11, color: '#8a2418', marginTop: 6, lineHeight: 1.7 }}>{error}</p>}
      <p style={{ fontSize: 10, color: '#8a8168', marginTop: 6, fontStyle: 'italic' }}>変更は30日に1回までです。</p>
    </form>
  )
}
