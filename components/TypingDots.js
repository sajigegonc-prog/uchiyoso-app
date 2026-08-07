export default function TypingDots({ names, dark }) {
  if (!names || names.length === 0) return null
  const label = names.join('、') + ' が入力中…'
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 4 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '10px 14px',
        background: dark ? '#252b40' : '#fff',
        border: `1px solid ${dark ? '#3a4360' : '#211d17'}`,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: dark ? '#7a82a0' : '#8a8168', animation: 'typingBounce 1.2s infinite ease-in-out' }} />
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: dark ? '#7a82a0' : '#8a8168', animation: 'typingBounce 1.2s infinite ease-in-out .15s' }} />
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: dark ? '#7a82a0' : '#8a8168', animation: 'typingBounce 1.2s infinite ease-in-out .3s' }} />
      </div>
      <span style={{ fontSize: 10, color: dark ? '#6d7690' : '#8a8168', fontStyle: dark ? 'normal' : 'italic', fontFamily: dark ? "'Courier New', monospace" : 'inherit' }}>
        {label}
      </span>
      <style>{`@keyframes typingBounce { 0%,60%,100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-4px); opacity: 1; } }`}</style>
    </div>
  )
}