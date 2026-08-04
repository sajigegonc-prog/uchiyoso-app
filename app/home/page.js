import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { getNotifications } from '@/lib/notifications'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, onboarding_completed')
    .eq('id', user.id)
    .single()
  if (!profile?.onboarding_completed) {
    redirect('/onboarding/name')
  }
  const notifications = await getNotifications(supabase, user.id)

  const noticeStyle = {
    display: 'block', background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3,
    padding: 10, fontSize: 12.5, color: '#5c3a21', textDecoration: 'none',
  }

  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh',
      padding: '28px 20px 100px',
    }}>
      <h1 style={{ fontSize: 18, color: '#3d2717', fontWeight: 700, borderBottom: '3px solid #8b5a2b', paddingBottom: 8, display: 'inline-block' }}>
        ホーム
      </h1>
      <p style={{ fontSize: 14, color: '#5c3a21', marginTop: 10 }}>ようこそ、{profile?.display_name || user.email} さん</p>

      {(notifications.chat || notifications.owl || notifications.matching) && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.chat && (
            <Link href="/chat" style={noticeStyle}>
              💬 あなたに話しかけた人がいるようです
            </Link>
          )}
          {notifications.owl && (
            <Link href="/owl" style={noticeStyle}>
              🦉 あなたの部屋にフクロウが来ています
            </Link>
          )}
          {notifications.matching && (
            <Link href="/chat" style={noticeStyle}>
              👋 あなたと偶然すれ違った方がいるようです
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
