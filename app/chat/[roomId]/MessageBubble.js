'use client'
import { useState } from 'react'

export default function MessageBubble({ msg, mine, isOwner, speakerName, speakerIcon, roomId, editAction, deleteAction }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)

  if (msg.deleted_at) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: mine ? 'row-reverse' : 'row' }}>
        <div style={{ width: 30, height: 30, flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: '#8a8168', fontStyle: 'italic', padding: '9px 13px' }}>
          （メッセージは削除されました）
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: mine ? 'row-reverse' : 'row' }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        background: '#211d17', border: '1px solid #211d17',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#f4eee0', fontWeight: 700, fontSize: 12, fontFamily: 'Georgia, serif',
      }}>
        {speakerIcon ? <img src={speakerIcon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (speakerName || '?').charAt(0)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
        {!mine && <div style={{ fontSize: 10.5, color: '#6b6250', marginBottom: 3, fontStyle: 'italic' }}>{speakerName}</div>}
        {editing ? (
          <form
            action={async (formData) => { await editAction(formData); setEditing(false) }}
            style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}
          >
            <input type="hidden" name="message_id" value={msg.id} />
            <input type="hidden" name="room_id" value={roomId} />
            <textarea
              name="content"
              defaultValue={msg.content}
              rows={2}
              style={{ fontSize: 14, padding: 8, border: '1px solid #211d17', fontFamily: "'BIZ UDPGothic', sans-serif" }}
            />
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditing(false)} style={{ fontSize: 11, padding: '4px 10px', border: '1px solid #8a8168', background: '#fff', color: '#6b6250', cursor: 'pointer' }}>キャンセル</button>
              <button type="submit" style={{ fontSize: 11, padding: '4px 10px', border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', cursor: 'pointer' }}>保存</button>
            </div>
          </form>
        ) : (
          <div onClick={() => isOwner && setMenuOpen((v) => !v)} style={{ cursor: isOwner ? 'pointer' : 'default', width: '100%' }}>
            <div style={{
              padding: '9px 13px', fontSize: 14, lineHeight: 1.6,
              background: mine ? '#211d17' : '#fff', color: mine ? '#f4eee0' : '#211d17',
              border: '1px solid #211d17',
              display: 'inline-block',
            }}>
              {msg.content}
            </div>
            {msg.edited_at && (
              <div style={{ fontSize: 9, color: '#8a8168', marginTop: 2, fontStyle: 'italic', textAlign: mine ? 'right' : 'left' }}>(編集済み)</div>
            )}
          </div>
        )}
        {isOwner && menuOpen && !editing && (
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" onClick={() => { setEditing(true); setMenuOpen(false) }} style={{ fontSize: 10.5, color: '#6b6250', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>編集</button>
            <form action={deleteAction}>
              <input type="hidden" name="message_id" value={msg.id} />
              <input type="hidden" name="room_id" value={roomId} />
              <button
                type="submit"
                onClick={(e) => { if (!confirm('このメッセージを削除しますか？')) e.preventDefault() }}
                style={{ fontSize: 10.5, color: '#8a2418', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
              >
                削除
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
