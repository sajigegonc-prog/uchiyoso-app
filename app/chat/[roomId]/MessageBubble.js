'use client'
import { useState, useTransition } from 'react'
import OcInfoModal from '@/components/OcInfoModal'
import { getOcDetailForRoom } from './ocPreviewActions'

export default function MessageBubble({ msg, mine, isOwner, speakerName, speakerIcon, roomId, editAction, deleteAction }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [detail, setDetail] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, startTransition] = useTransition()

  if (msg.deleted_at) {
    return null
  }

  function handleEditSubmit(formData) {
    setError(null)
    startTransition(async () => {
      const result = await editAction(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  function handleDelete(formData) {
    setError(null)
    startTransition(async () => {
      const result = await deleteAction(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setMenuOpen(false)
      }
    })
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: mine ? 'row-reverse' : 'row' }}>
      <div
        onClick={async () => {
          if (!msg.sender_oc_id) return
          setShowModal(true)
          try {
            const result = await getOcDetailForRoom(msg.sender_oc_id, roomId)
            if (result?.oc) setDetail(result.oc)
            else setDetail({ error: result?.error || '取得に失敗しました' })
          } catch (e) {
            setDetail({ error: '通信エラーが発生しました' })
          }
        }}
        style={{
          width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          background: '#211d17', border: '1px solid #211d17',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#f4eee0', fontWeight: 700, fontSize: 12, fontFamily: 'Georgia, serif',
          cursor: msg.sender_oc_id ? 'pointer' : 'default',
        }}
      >
        {speakerIcon ? <img src={speakerIcon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (speakerName || '?').charAt(0)}
      </div>
      {showModal && (
        <OcInfoModal onClose={() => { setShowModal(false); setDetail(null) }}>
          {!detail ? (
            <p style={{ fontSize: 12.5, color: '#8a8168' }}>読み込み中…</p>
          ) : detail.error ? (
            <p style={{ fontSize: 12.5, color: '#8a2418' }}>エラー: {detail.error}</p>
          ) : (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{detail.name}</div>
              <div style={{ fontSize: 11, color: '#8a8168', marginTop: 4 }}>{detail.oc_type === 'dreamer' ? '夢主' : '創作キャラ'}{detail.house ? ` ・ ${detail.house}` : ''}</div>
              {detail.oc_type === 'dreamer' && detail.paired_character && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, color: '#6b6250' }}>お相手</div>
                  <div style={{ fontSize: 13, marginTop: 2 }}>{detail.paired_character}</div>
                </div>
              )}
              {detail.birth_date && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 10, color: '#6b6250' }}>生年月日</div>
                  <div style={{ fontSize: 13, marginTop: 2 }}>{new Date(detail.birth_date).getMonth() + 1}月{new Date(detail.birth_date).getDate()}日
                <div style={{ fontSize: 13, marginTop: 2 }}>{new Date(detail.birth_date).getFullYear()}年{new Date(detail.birth_date).getMonth() + 1}月{new Date(detail.birth_date).getDate()}日</div></div>
                </div>
              )}
              {detail.description && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 10, color: '#6b6250' }}>設定・紹介文</div>
                  <p style={{ fontSize: 12.5, marginTop: 4, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{detail.description}</p>
                </div>
              )}
            </>
          )}
        </OcInfoModal>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
        {!mine && <div style={{ fontSize: 10.5, color: '#6b6250', marginBottom: 3, fontStyle: 'italic' }}>{speakerName}</div>}
        {editing ? (
          <form
            action={handleEditSubmit}
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
            {error && <p style={{ fontSize: 11, color: '#8a2418' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setEditing(false); setError(null) }} style={{ fontSize: 11, padding: '4px 10px', border: '1px solid #8a8168', background: '#fff', color: '#6b6250', cursor: 'pointer' }}>キャンセル</button>
              <button type="submit" disabled={isPending} style={{ fontSize: 11, padding: '4px 10px', border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', cursor: 'pointer' }}>
                {isPending ? '保存中…' : '保存'}
              </button>
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
          </div>
        )}
        {isOwner && menuOpen && !editing && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', gap: 4, marginTop: 4 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setEditing(true)} style={{ fontSize: 10.5, color: '#6b6250', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>編集</button>
              <form
                action={(formData) => {
                  if (confirm('このメッセージを削除しますか？')) handleDelete(formData)
                }}
              >
                <input type="hidden" name="message_id" value={msg.id} />
                <input type="hidden" name="room_id" value={roomId} />
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ fontSize: 10.5, color: '#8a2418', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {isPending ? '削除中…' : '削除'}
                </button>
              </form>
            </div>
            {error && <p style={{ fontSize: 10.5, color: '#8a2418' }}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
