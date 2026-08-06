'use client'
import { useState, useTransition } from 'react'

export default function ProfileMetaForm({ action, emoji, bio }) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleSubmit(formData) {
    setSaved(false)
    startTransition(async () => {
      await action(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <form action={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
      <input
        name="emoji"
        defaultValue={emoji}
        placeholder="絵文字"
        maxLength={4}
        style={{ width: 60, padding: '10px 8px', fontSize: 16, textAlign: 'center', background: '#fff', border: '1px solid #211d17', color: '#211d17' }}
      />
      <input
        name="bio"
        defaultValue={bio}
        placeholder="一言プロフィール(60字まで)"
        maxLength={60}
        style={{ flex: 1, padding: '10px 12px', fontSize: 13, background: '#fff', border: '1px solid #211d17', color: '#211d17' }}
      />
      <button type="submit" disabled={isPending} style={{ flexShrink: 0, padding: '10px 14px', border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
        {isPending ? '…' : saved ? '✓' : '保存'}
      </button>
    </form>
  )
}
