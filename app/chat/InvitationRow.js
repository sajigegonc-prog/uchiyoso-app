'use client'
import { lightInputStyle, lightBtnStyle } from '../ocs/styles'
export default function InvitationRow({ invitation, myOcs, action }) {
  return (
    <div style={{ background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3, padding: 12 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#241a10' }}>
        {invitation.room_name || '名前未設定の部屋'}
      </div>
      <div style={{ fontSize: 12, color: '#8b7355', marginTop: 2 }}>
        {invitation.inviter_name || '名前未設定'} さんから招待されています
      </div>
      <form action={action} style={{ marginTop: 10 }}>
        <input type="hidden" name="invitation_id" value={invitation.invitation_id} />
        <input type="hidden" name="room_id" value={invitation.room_id} />
        {myOcs.length > 0 ? (
          <select name="oc_id" style={{ ...lightInputStyle, marginBottom: 8 }} defaultValue={myOcs[0]?.id}>
            {myOcs.map((oc) => (
              <option key={oc.id} value={oc.id}>{oc.name}</option>
            ))}
          </select>
        ) : (
          <p style={{ fontSize: 11.5, color: '#8b7355', marginBottom: 8 }}>
            参加させるOCがありません。先にOCを登録してください。
          </p>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="submit"
            name="decision"
            value="accepted"
            disabled={myOcs.length === 0}
            style={{ ...lightBtnStyle, marginTop: 0, padding: '8px 14px', fontSize: 12.5 }}
          >
            承認する
          </button>
          <button
            type="submit"
            name="decision"
            value="declined"
            style={{ ...lightBtnStyle, marginTop: 0, padding: '8px 14px', fontSize: 12.5, background: '#fff', color: '#8b7355', boxShadow: 'none', border: '2px solid #d8c7ac' }}
          >
            断る
          </button>
        </div>
      </form>
    </div>
  )
}
