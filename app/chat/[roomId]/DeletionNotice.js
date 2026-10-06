'use client'
import { useState } from 'react'
import { useT } from '@/lib/i18n/client'

export default function DeletionNotice({ roomId, action }) {
  const t = useT()
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(36,26,16,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110,
    }}>
      <div style={{ background: '#fbf5e9', borderRadius: 3, padding: 22, maxWidth: 300, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#241a10', lineHeight: 1.8 }}>
          {t('このルームは相手によって削除されました。')}<br />
          {t('ログなどを保存したのち、あなたも削除してください。')}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button
            type="button"
            onClick={() => setVisible(false)}
            style={{ flex: 1, padding: 10, borderRadius: 3, border: '2px solid #d8c7ac', background: '#fff', color: '#8b7355', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
          >
            {t('後で(閉じる)')}
          </button>
          <form action={action} style={{ flex: 1 }}>
            <input type="hidden" name="room_id" value={roomId} />
            <button
              type="submit"
              style={{ width: '100%', padding: 10, borderRadius: 3, border: 'none', background: '#8b5a2b', color: '#f3e9d8', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
            >
              {t('私も削除する')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
