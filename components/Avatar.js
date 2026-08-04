function avatarGradient(name) {
  const colors = [
    ['#6b5b95', '#3a2f5c'], ['#8b5a3c', '#5c3a21'], ['#3c6b5a', '#1f3d33'],
    ['#8b3c5a', '#5c1f33'], ['#3c5a8b', '#1f335c'],
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const [from, to] = colors[Math.abs(hash) % colors.length]
  return `linear-gradient(145deg, ${from}, ${to})`
}

export default function Avatar({ name, iconUrl, size = 48 }) {
  const initial = (name || '?').charAt(0)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      background: iconUrl ? '#ddd' : avatarGradient(name || ''),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.4,
    }}>
      {iconUrl ? (
        <img src={iconUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : initial}
    </div>
  )
}
