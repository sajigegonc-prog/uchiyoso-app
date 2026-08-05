'use client'
import { useState } from 'react'

export default function AddMemberButton({ roomId, action, friendOcs }) {
  const [open, setOpen] = useState(false)
  const [slots, setSlots] = useState([{ friendUserId: '', ocId: '' }])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)

  if (!friendOcs || friendOcs.length === 0) return null

  const friendList = []
  const seen = new Set()
  for (const f of friendOcs) {
    if (!seen.has(f.friend_user_id)) {
      seen.add(f.friend_user_id)
      friendList.push({ userId: f.friend_user_id, label: f.friend_display_name || '名前未設定' })
    }
  }
  function ocsOfFriend(userId) {
    return friendOcs.filter((f) => f.friend_user_id === userId)
  }

  function updateSlotFriend(index, userId) {
    setSlots((prev) => prev.map((s, i) => i === index ? { friendUserId: userId, ocId: '' } : s))
  }
  function updateSlotOc(index, ocId) {
    setSlots((prev) => prev.map((s, i) => i === index ? { ...s, ocId } : s))
  }
  function addSlot() {
    setSlots((prev) => [...prev, { friendUserId: '', ocId: '' }])
  }
  function removeSlot(index) {
    setSlots((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    setPending(true)
    setError(null)
    const formData = new FormData()
    formData.set('room_id', roomId)
    slots.filter((s) => s.ocId).forEach((s) => formData.append('friend_oc_ids', s.ocId))
    const result = await action(formData)
    setPending(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
      setSlots([{ friendUserId: '', ocId: '' }])
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ fontSize: 11, color: '#6b6250', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        +メンバー招待
      </button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(33,29,23,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div style={{ background: '#f4eee0', border: '1px solid #211d17', padding: 20, maxWidth: 320, width: '90%', maxHeight: '75vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#211d17', marginBottom: 10, fontFamily: 'Georgia, serif' }}>招待するメンバーを選ぶ</div>
            {slots.map((slot, index) => (
              <div key={index} style={{ marginTop: 10, padding: 10, border: '1px solid #8a8168', background: '#fff' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={slot.friendUserId}
                    onChange={(e) => updateSlotFriend(index, e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', fontSize: 13, border: '1px solid #211d17', background: '#fff', color: '#211d17' }}
                  >
                    <option value="">中の人を選んでください</option>
                    {friendList.map((f) => (
                      <option key={f.userId} value={f.userId}>{f.label}</option>
                    ))}
                  </select>
                  {slots.length > 1 && (
                    <button type="button" onClick={() => removeSlot(index)} style={{ border: 'none', background: 'none', color: '#8a2418', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>×</button>
                  )}
                </div>
                {slot.friendUserId && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {ocsOfFriend(slot.friendUserId).map((oc) => (
                      <label key={oc.oc_id} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', cursor: 'pointer',
                        border: slot.ocId === oc.oc_id ? '1px solid #211d17' : '1px solid #8a8168',
                        background: slot.ocId === oc.oc_id ? '#f4eee0' : '#fff', fontSize: 12, color: '#211d17',
                      }}>
                        <input type="radio" name={`slot_${index}`} checked={slot.ocId === oc.oc_id} onChange={() => updateSlotOc(index, oc.oc_id)} style={{ width: 13, height: 13 }} />
                        {oc.oc_name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSlot}
              style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 10, padding: 9, border: '1px dashed #6b6250', background: 'none', color: '#3d2717', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              + 友達を追加
            </button>
            {error && <p style={{ fontSize: 11.5, color: '#8a2418', marginTop: 10, lineHeight: 1.7 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, padding: 9, border: '1px solid #8a8168', background: '#fff', color: '#6b6250', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                キャンセル
              </button>
              <button type="button" onClick={handleSubmit} disabled={pending} style={{ flex: 1, padding: 9, border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                {pending ? '招待中…' : '招待する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
