'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/home', label: 'ホーム', match: (p) => p === '/home', badgeKey: null },
  { href: '/chat', label: 'おしゃべり', match: (p) => p.startsWith('/chat'), badgeKey: 'chat' },
  { href: '/ocs', label: 'OC', match: (p) => p.startsWith('/ocs'), badgeKey: null },
  { href: '/friends', label: '友達', match: (p) => p.startsWith('/friends'), badgeKey: null },
  { href: '/owl', label: 'ふくろう便', match: (p) => p.startsWith('/owl'), badgeKey: 'owl' },
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
        background: '#f4eee0', borderTop: '4px double #211d17',
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
              textDecoration: 'none', color: active ? '#211d17' : '#a39a80',
              fontSize: 10, gap: 3, position: 'relative',
              borderRight: i < NAV_ITEMS.length - 1 ? '1px solid #d8cdb0' : 'none',
            }}
          >
            <span style={{
              fontSize: 10.5, fontWeight: active ? 700 : 400, letterSpacing: '.03em',
              fontFamily: active ? 'Georgia, serif' : "'BIZ UDPGothic', sans-serif",
              position: 'relative',
            }}>
              {item.label}
              {showBadge && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#8a2418',
                }} />
              )}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
