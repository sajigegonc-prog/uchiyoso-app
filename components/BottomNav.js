'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/home', label: 'ホーム', icon: '🏠', match: (p) => p === '/home', badgeKey: null },
  { href: '/chat', label: 'おしゃべり', icon: '💬', match: (p) => p.startsWith('/chat'), badgeKey: 'chat' },
  { href: '/ocs', label: 'OC', icon: '📖', match: (p) => p.startsWith('/ocs'), badgeKey: null },
  { href: '/friends', label: '友達', icon: '🤝', match: (p) => p.startsWith('/friends'), badgeKey: null },
  { href: '/owl', label: 'ふくろう便', icon: '🦉', match: (p) => p.startsWith('/owl'), badgeKey: 'owl' },
]

const HIDDEN_PREFIXES = ['/onboarding', '/dev']

export default function BottomNav({ notifications = {} }) {
  const pathname = usePathname()
  const hidden = pathname === '/' || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))
  if (hidden) return null

  return (
    <nav
      style={{
        height: 60,
        background: '#241a10', borderTop: '2px solid #5c3a21',
        display: 'flex', width: '100%',
      }}
    >
      {NAV_ITEMS.map((item, i) => {
        const active = item.match(pathname)
        const showBadge = item.badgeKey && notifications[item.badgeKey]
        return (
          <Link
            key={i}
            href={item.href}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', color: active ? '#f3e9d8' : 'rgba(243,233,216,.5)',
              fontSize: 10, gap: 2, position: 'relative',
            }}
          >
            <span style={{ fontSize: 20, position: 'relative' }}>
              {item.icon}
              {showBadge && (
                <span style={{
                  position: 'absolute', top: -2, right: -6,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#e0503c', border: '1px solid #241a10',
                }} />
              )}
            </span>
            <span style={{ fontWeight: active ? 700 : 400 }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
