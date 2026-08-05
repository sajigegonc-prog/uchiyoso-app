'use client'
import { useState } from 'react'

export default function InvitationRow({ invitation, myOcs, action }) {
  const [ocId, setOcId] = useState(myOcs[0]?.id || '')
  return (
    <div style={{ border: '1px solid #211d17', padding: 12, marginBottom: 10, background: '#fff' }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif' }}>
        {invitation.room_name || '名前未設定の部屋'}
      </div>
      <div style={{ fontSize: 11, color: '#6b6250', marginTop: 3, fontStyle: 'italic' }}>
        {invitation.inviter_name || '名前未設定'} さんから招待されています
      </div>
      <form action={action} style={{ marginTop: 10 }}>
        <input type="hidden" name="invitation_id" value={invitation.invitation_id} />
        <input type="hidden" name="room_id" value={invitation.room_id} />
        {myOcs.length > 0 ? (
          <select name="oc_id" value={ocId} onChange={(e) => setOcId(e.target.value)} style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #211d17', background: '#fff', color: '#211d17', marginBottom: 8 }}>
            {myOcs.map((oc) => <option key={oc.id} value={oc.id}>{oc.name}</option>)}
          </select>
        ) : (
          <p style={{ fontSize: 11.5, color: '#8a8168', marginBottom: 8, fontStyle: 'italic' }}>参加させるOCがありません。先にOCを登録してください。</p>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" name="decision" value="accepted" disabled={myOcs.length === 0}
            style={{ border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontSize: 12, fontWeight: 700, padding: '6px 14px', cursor: 'pointer' }}>
            承認する
          </button>
          <button type="submit" name="decision" value="declined"
            style={{ border: '1px solid #8a8168', background: '#fff', color: '#6b6250', fontSize: 12, fontWeight: 700, padding: '6px 14px', cursor: 'pointer' }}>
            断る
          </button>
        </div>
      </form>
    </div>
  )
}
