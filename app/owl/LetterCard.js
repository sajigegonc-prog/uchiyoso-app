import Link from 'next/link'
import { getT } from '@/lib/i18n/server'

export default function LetterCard({ letter }) {
  const t = getT()
  const isUnread = !letter.read_at && letter.direction === 'received'

  return (
    <Link
      href={`/owl/${letter.id}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
        background: isUnread
          ? 'linear-gradient(160deg, #f3e6c8 0%, #e8d6ac 55%, #ddc794 100%)'
          : 'linear-gradient(160deg, #f3e6c8 0%, #e8d6ac 55%, #ddc794 100%)',
        opacity: isUnread ? 1 : 0.55,
        border: '1px solid #c9a876',
        padding: '11px 10px',
        marginTop: 8,
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: isUnread ? '#8a2418' : 'transparent',
      }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: isUnread ? 700 : 400, color: '#3d2c14', fontFamily: 'Georgia, serif' }}>
          {letter.direction === 'received' ? t('{name} より', { name: letter.senderName }) : t('{name} へ', { name: letter.recipientName })}
        </div>
        {isUnread && (
          <div style={{ fontSize: 9.5, color: '#7a6537', marginTop: 2, fontStyle: 'italic' }}>{t('未開封')}</div>
        )}
      </div>
    </Link>
  )
}
