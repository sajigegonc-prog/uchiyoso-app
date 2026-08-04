'use client'
import { useState } from 'react'
import { markLetterRead } from './actions'

export default function LetterCard({ letter }) {
  const [open, setOpen] = useState(false)
  const isUnread = !letter.read_at && letter.direction === 'received'

  async function handleOpen() {
    setOpen((v) => !v)
    if (isUnread) {
      const formData = new FormData()
      formData.set('letter_id', letter.id)
      await markLetterRead(formData)
    }
  }

  return (
    <div style={{
      background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3,
      padding: 14, cursor: 'pointer',
    }} onClick={handleOpen}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#241a10' }}>
          {isUnread && <span style={{ color: '#e0503c', marginRight: 6 }}>●</span>}
          {letter.direction === 'received' ? `${letter.senderName} より` : `${letter.recipientName} へ`}
        </div>
        <span style={{ fontSize: 11, color: '#8b7355' }}>{open ? '閉じる' : '開く'}</span>
      </div>
      {!open && (
        <div style={{
          fontSize: 12.5, color: '#8b7355', marginTop: 6,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {letter.content}
        </div>
      )}
      {open && (
        <p style={{ fontSize: 13, color: '#241a10', marginTop: 10, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {letter.content}
        </p>
      )}
    </div>
  )
}
