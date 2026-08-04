'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/home', label: 'ホーム', icon: '🏠', match: (p) => p === '/home' },
  { href: '/chat', label: 'おしゃべり', icon: '💬', match: (p) => p.startsWith('/chat') },
  { href: '/home', label: 'OC', icon: '📖', match: () => false },
  { href: '/friends', label: '友達', icon: '🤝', match: (p) => p.startsWith('/friends') },
  { href: '/owl', label: 'ふくろう便', icon: '🦉', match: (p) => p.startsWith('/owl') },
]

const HIDDEN_PREFIXES = ['/onboarding', '/dev']

export default function BottomNav() {
  const pathname = usePathname()
  const hidden = pathname === '/' || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))
  if (hidden) return null

  return (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 60,
        background: '#241a10', borderTop: '2px solid #5c3a21',
        display: 'flex', zIndex: 50,
      }}
    >
      {NAV_ITEMS.map((item, i) => {
        const active = item.match(pathname)
        return (
          <Link
            key={i}
            href={item.href}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', color: active ? '#f3e9d8' : 'rgba(243,233,216,.5)',
              fontSize: 10, gap: 2,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontWeight: active ? 700 : 400 }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
