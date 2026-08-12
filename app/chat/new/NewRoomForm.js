'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createRoom } from '../actions'

const labelStyle = { fontSize: 11, color: '#6b6250', display: 'block', marginBottom: 5, letterSpacing: '.05em' }
const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 15,
  background: '#fff', border: '1px solid #211d17', color: '#211d17',
  boxSizing: 'border-box', fontFamily: "'BIZ UDPGothic', sans-serif",
}
const btnStyle = {
  padding: '11px 20px', border: '1px solid #211d17',
  fontSize: 14, fontWeight: 700, cursor: 'pointer',
  background: '#211d17', color: '#f4eee0', letterSpacing: '.05em',
}
const btnGhostStyle = { ...btnStyle, background: '#fff', color: '#6b6250', border: '1px solid #8a8168' }
const typeBtnStyle = (active) => ({
  display: 'block', width: '100%', padding: 16, marginBottom: 10,
  border: active ? '1px solid #211d17' : '1px solid #8a8168',
  background: active ? '#fff' : '#f4eee0', color: '#211d17',
  fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
})

    export default function NewRoomForm({ ocs, friendOcs, initialFriendOcId, dreamPartner }) {
  const router = useRouter()
  const initialFriendUserId = friendOcs.find((f) => f.oc_id === initialFriendOcId)?.friend_user_id || ''
  const [step, setStep] = useState(0)
  const [roomType, setRoomType] = useState(initialFriendOcId ? 'one' : '')
  const [speakerOcId, setSpeakerOcId] = useState(ocs[0]?.id || '')
  const [extraOcIds, setExtraOcIds] = useState([])
  const [oneFriendUserId, setOneFriendUserId] = useState(initialFriendUserId)
  const [oneFriendOcId, setOneFriendOcId] = useState(initialFriendOcId || '')
  const [groupSlots, setGroupSlots] = useState([{ friendUserId: '', ocId: '' }])
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [location, setLocation] = useState('')
  const [timePeriod, setTimePeriod] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const submittingRef = useRef(false)

  const otherOcs = ocs.filter((oc) => oc.id !== speakerOcId)

  const friendGroups = []
  const seenFriend = new Set()
  for (const f of friendOcs) {
    if (!seenFriend.has(f.friend_user_id)) {
      seenFriend.add(f.friend_user_id)
      friendGroups.push({ userId: f.friend_user_id, label: f.friend_display_name || '名前未設定' })
    }
  }
  function ocsOfFriend(userId) {
    return friendOcs.filter((f) => f.friend_user_id === userId)
  }
  function toggleExtraOc(id) {
    const isDreamPartner = dreamPartner && id === dreamPartner.id
    setExtraOcIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (isDreamPartner) return [id]
      if (dreamPartner && prev.includes(dreamPartner.id)) return prev
      return [...prev, id]
    })
  }
  const dreamPartnerSelected = dreamPartner && extraOcIds.includes(dreamPartner.id)
  function updateSlotFriend(index, userId) {
    setGroupSlots((prev) => prev.map((s, i) => i === index ? { friendUserId: userId, ocId: '' } : s))
  }
  function updateSlotOc(index, ocId) {
    setGroupSlots((prev) => prev.map((s, i) => i === index ? { ...s, ocId } : s))
  }
  function addSlot() {
    setGroupSlots((prev) => [...prev, { friendUserId: '', ocId: '' }])
  }
  function removeSlot(index) {
    setGroupSlots((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (submittingRef.current) return
    submittingRef.current = true
    setPending(true)
    setError(null)

    const formData = new FormData()
    formData.set('oc_id', speakerOcId)
    formData.set('location', location)
    formData.set('time_period', timePeriod)
    const roomTypeValue =
      roomType === 'self' ? 'self' :
      roomType === 'solo' ? 'solo' :
      roomType === 'one' ? 'friend_1on1' : 'friend_group'
    formData.set('room_type', roomTypeValue)
    formData.set('note', note)
    if (roomType === 'self') {
      extraOcIds.forEach((id) => formData.append('extra_oc_ids', id))
    } else if (roomType === 'one') {
      formData.append('friend_oc_ids', oneFriendOcId)
    } else if (roomType === 'group') {
      groupSlots.filter((s) => s.ocId).forEach((s) => formData.append('friend_oc_ids', s.ocId))
      formData.set('title', title)
    }

    const result = await createRoom(formData)
    submittingRef.current = false
    setPending(false)
    if (result?.error) {
      setError(result.error)
    } else if (result?.id) {
      router.push(`/chat/${result.id}`)
    }
  }

  const validGroupSlotCount = groupSlots.filter((s) => s.ocId).length
  const canProceedToDetails = roomType === 'self' || roomType === 'solo'
    ? true
    : roomType === 'one'
      ? !!oneFriendOcId
      : validGroupSlotCount >= 2
  const canSubmit = roomType === 'group' ? title.trim().length > 0 && canProceedToDetails : canProceedToDetails

  const hasStep2Content = roomType === 'self' || roomType === 'group'

  return (
    <div style={{ width: '100%', maxWidth: 360, marginTop: 16 }}>
      <div style={{ fontSize: 11, color: '#6b6250', fontWeight: 700, marginBottom: 12, letterSpacing: '.1em' }}>
        {step + 1} / 3
      </div>

      {step === 0 && (
        <div>
          <button type="button" style={typeBtnStyle(roomType === 'one')} onClick={() => { setRoomType('one'); setStep(1) }}>
            お友達とおしゃべり
          </button>
          <button type="button" style={typeBtnStyle(roomType === 'group')} onClick={() => { setRoomType('group'); setStep(1) }}>
            複数のお友達とおしゃべり
          </button>
          <button type="button" style={typeBtnStyle(roomType === 'self')} onClick={() => { setRoomType('self'); setStep(1) }}>
            うちの子同士でおしゃべり
          </button>
          <button type="button" style={typeBtnStyle(roomType === 'solo')} onClick={() => { setRoomType('solo'); setStep(1) }}>
            独り言・NPCとおしゃべり
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <label style={labelStyle}>どのキャラでおしゃべりしますか?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8, marginBottom: 8 }}>
            {ocs.map((oc) => (
              <button key={oc.id} type="button" onClick={() => setSpeakerOcId(oc.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  width: 76, padding: '10px 6px', cursor: 'pointer',
                  border: speakerOcId === oc.id ? '1px solid #211d17' : '1px solid #8a8168',
                  background: speakerOcId === oc.id ? '#fff' : '#f4eee0',
                }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
                  background: '#211d17', border: '1px solid #211d17',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f4eee0', fontWeight: 700, fontSize: 15, fontFamily: 'Georgia, serif',
                }}>
                  {oc.icon_url ? <img src={oc.icon_url} alt={oc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : oc.name?.charAt(0)}
                </div>
                <span style={{ fontSize: 11, color: '#211d17', textAlign: 'center', lineHeight: 1.3 }}>{oc.name}</span>
              </button>
            ))}
          </div>
          {roomType === 'solo' ? (
            <p style={{ fontSize: 11, color: '#8a8168', lineHeight: 1.7, fontStyle: 'italic' }}>
              このキャラだけの部屋です。あとからNPCを自由に追加できます。
            </p>
          ) : (
            <p style={{ fontSize: 11, color: '#8a8168', lineHeight: 1.7, fontStyle: 'italic' }}>
              おしゃべりの中でいつでも他の子に切り替えることができます。
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
            <button type="button" style={btnGhostStyle} onClick={() => setStep(0)}>戻る</button>
            <button
              type="button"
              style={btnStyle}
              onClick={() => (roomType === 'solo' ? setStep(2) : setStep(2))}
              disabled={!speakerOcId}
            >
              次へ
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>場所(任意)</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例:図書室3階" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>時間帯(任意)</label>
            <input value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} placeholder="例:放課後、夜" style={inputStyle} />
          </div>

          {roomType === 'group' && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>部屋のタイトル</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例:談話室" style={inputStyle} />
            </div>
          )}

          {roomType === 'self' && (
  <div style={{ marginBottom: 14 }}>
    <label style={labelStyle}>一緒に参加させるOC</label>

    {otherOcs.length === 0 && (
      <p style={{ fontSize: 12.5, color: '#8a8168', fontStyle: 'italic' }}>
        他に登録済みのOCがありません。
      </p>
    )}

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
      {otherOcs.map((oc) => (
        <label
          key={oc.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            width: 76,
            padding: '10px 6px',
            cursor: 'pointer',
            border: '1px solid #8a8168',
            background: '#fff',
          }}
        >
          <input
            type="checkbox"
            checked={extraOcIds.includes(oc.id)}
            onChange={() => toggleExtraOc(oc.id)}
            disabled={dreamPartnerSelected}
            style={{ width: 16, height: 16, opacity: dreamPartnerSelected ? .4 : 1 }}
          />

          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#211d17',
              border: '1px solid #211d17',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f4eee0',
              fontWeight: 700,
              fontSize: 13,
              fontFamily: 'Georgia, serif',
            }}
          >
            {oc.icon_url ? (
              <img
                src={oc.icon_url}
                alt={oc.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              oc.name?.charAt(0)
            )}
          </div>

          <span
            style={{
              fontSize: 10.5,
              color: '#211d17',
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            {oc.name}
          </span>
        </label>
      ))}
    </div>

    {dreamPartner && (
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            fontSize: 10,
            color: '#8a2418',
            letterSpacing: '.05em',
            marginBottom: 6,
          }}
        >
          夢相手
        </div>

        <label
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            width: 76,
            padding: '10px 6px',
            cursor: 'pointer',
            border: '1px dashed #8a2418',
            background: '#fff',
          }}
        >
          <input
            type="checkbox"
            checked={extraOcIds.includes(dreamPartner.id)}
            onChange={() => toggleExtraOc(dreamPartner.id)}
            style={{ width: 16, height: 16 }}
          />

          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#211d17',
              border: '1px solid #8a2418',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f4eee0',
              fontWeight: 700,
              fontSize: 13,
              fontFamily: 'Georgia, serif',
            }}
          >
            {dreamPartner.icon_url ? (
              <img
                src={dreamPartner.icon_url}
                alt={dreamPartner.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              dreamPartner.name?.charAt(0)
            )}
          </div>

          <span
            style={{
              fontSize: 10.5,
              color: '#211d17',
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            {dreamPartner.name}
          </span>
        </label>
      </div>
    )}
  </div>
)}

          {roomType === 'solo' && (
            <p style={{ fontSize: 11.5, color: '#8a8168', marginBottom: 14, fontStyle: 'italic', lineHeight: 1.8 }}>
              このまま作成すると、あなただけの部屋になります。作成後、部屋の中でNPCを追加しておしゃべりできます。
            </p>
          )}

          {roomType === 'one' && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>中の人</label>
              <select
                value={oneFriendUserId}
                onChange={(e) => { setOneFriendUserId(e.target.value); setOneFriendOcId('') }}
                style={inputStyle}
              >
                <option value="">選んでください</option>
                {friendGroups.map((f) => (
                  <option key={f.userId} value={f.userId}>{f.label}</option>
                ))}
              </select>
              {friendGroups.length === 0 && <p style={{ fontSize: 12.5, color: '#8a8168', fontStyle: 'italic', marginTop: 8 }}>まだ友達がいません。</p>}

              {oneFriendUserId && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>OC</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    {ocsOfFriend(oneFriendUserId).map((oc) => (
                      <label key={oc.oc_id} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', cursor: 'pointer',
                        border: oneFriendOcId === oc.oc_id ? '1px solid #211d17' : '1px solid #8a8168',
                        background: oneFriendOcId === oc.oc_id ? '#fff' : '#f4eee0', fontSize: 12.5, color: '#211d17',
                      }}>
                        <input type="radio" name="one_friend_oc" checked={oneFriendOcId === oc.oc_id} onChange={() => setOneFriendOcId(oc.oc_id)} style={{ width: 14, height: 14 }} />
                        {oc.oc_name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {roomType === 'group' && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>招待する友達(2人以上・全員が友達である必要があります)</label>
              {friendGroups.length === 0 && <p style={{ fontSize: 12.5, color: '#8a8168', fontStyle: 'italic' }}>まだ友達がいません。</p>}
              {groupSlots.map((slot, index) => (
                <div key={index} style={{ marginTop: 10, padding: 10, border: '1px solid #8a8168', background: '#fff' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      value={slot.friendUserId}
                      onChange={(e) => updateSlotFriend(index, e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    >
                      <option value="">中の人を選んでください</option>
                      {friendGroups.map((f) => (
                        <option key={f.userId} value={f.userId}>{f.label}</option>
                      ))}
                    </select>
                    {groupSlots.length > 1 && (
                      <button type="button" onClick={() => removeSlot(index)} style={{ border: 'none', background: 'none', color: '#8a2418', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>×</button>
                    )}
                  </div>
                  {slot.friendUserId && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {ocsOfFriend(slot.friendUserId).map((oc) => (
                        <label key={oc.oc_id} style={{
                          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', cursor: 'pointer',
                          border: slot.ocId === oc.oc_id ? '1px solid #211d17' : '1px solid #8a8168',
                          background: slot.ocId === oc.oc_id ? '#f4eee0' : '#fff', fontSize: 12.5, color: '#211d17',
                        }}>
                          <input type="radio" name={`slot_${index}_oc`} checked={slot.ocId === oc.oc_id} onChange={() => updateSlotOc(index, oc.oc_id)} style={{ width: 14, height: 14 }} />
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
                style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 10, padding: 10, border: '1px dashed #6b6250', background: 'none', color: '#3d2717', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                + 友達を追加
              </button>
              <p style={{ fontSize: 11, color: '#8a8168', marginTop: 10, lineHeight: 1.7, fontStyle: 'italic' }}>
                1人の中の人につき、選べるOCは1人までです。
              </p>
            </div>
          )}
          {(roomType === 'one' || roomType === 'group') && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>一言メモ(任意)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="お相手への一言があれば書いてください"
                style={{ ...inputStyle, minHeight: 56, resize: 'none' }}
              />
              <p style={{ fontSize: 10.5, color: '#8a8168', marginTop: 6, lineHeight: 1.7, fontStyle: 'italic' }}>
                例: テンポ重視より、じっくり関係を築いていくタイプの子です。気長にお付き合いいただけると助かります
              </p>
            </div>
          )}

          {error && <p style={{ fontSize: 12, color: '#8a2418', marginTop: 8, lineHeight: 1.7 }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
            <button type="button" style={btnGhostStyle} onClick={() => setStep(1)} disabled={pending}>戻る</button>
            <button type="button" style={btnStyle} onClick={handleSubmit} disabled={!canSubmit || pending}>
              {pending ? 'おしゃべり作成中…' : 'この内容で作成する'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
