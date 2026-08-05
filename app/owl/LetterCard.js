import Link from 'next/link'

export default function LetterCard({ letter }) {
  const isUnread = !letter.read_at && letter.direction === 'received'

  return (
    <Link
      href={`/owl/${letter.id}`}
      style={{
        display: 'block', textDecoration: 'none',
        background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3,
        padding: 14,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#241a10' }}>
          {isUnread && <span style={{ color: '#e0503c', marginRight: 6 }}>●</span>}
          {letter.direction === 'received' ? `${letter.senderName} より` : `${letter.recipientName} へ`}
        </div>
        <span style={{ fontSize: 11, color: '#8b7355' }}>🦉</span>
      </div>
    </Link>
  )
}
