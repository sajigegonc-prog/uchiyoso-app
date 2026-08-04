import { redirect } from 'next/navigation'
import { getNotifications } from '@/lib/notifications'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
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
  const { data: ocs } = await supabase
    .from('ocs')
    .select('id, name, oc_type, house')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh',
      padding: '28px 20px 100px', position: 'relative',
    }}>
      <h1 style={{ fontSize: 18, color: '#3d2717', fontWeight: 700, borderBottom: '3px solid #8b5a2b', paddingBottom: 8, display: 'inline-block' }}>
        ホーム
      </h1>
          {(notifications.chat || notifications.owl || notifications.matching) && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.chat && (
            <div style={{ background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3, padding: 10, fontSize: 12.5, color: '#5c3a21' }}>
              💬 あなたに話しかけた人がいるようです
            </div>
          )}
          {notifications.owl && (
            <div style={{ background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3, padding: 10, fontSize: 12.5, color: '#5c3a21' }}>
              🦉 あなたの部屋にフクロウが来ています
            </div>
          )}
          {notifications.matching && (
            <div style={{ background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3, padding: 10, fontSize: 12.5, color: '#5c3a21' }}>
              👋 あなたと偶然すれ違った方がいるようです
            </div>
          )}
        </div>
      )}
      <p style={{ fontSize: 14, color: '#5c3a21', marginTop: 10 }}>ようこそ、{profile?.display_name || user.email} さん</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <Link href="/friends" style={{ fontSize: 12.5, color: '#8b5a2b', fontWeight: 700, textDecoration: 'none', border: '2px solid #8b6a4a', borderRadius: 3, padding: '8px 14px', background: '#fbf5e9' }}>
          フレンド
        </Link>
        <Link href="/chat" style={{ fontSize: 12.5, color: '#8b5a2b', fontWeight: 700, textDecoration: 'none', border: '2px solid #8b6a4a', borderRadius: 3, padding: '8px 14px', background: '#fbf5e9' }}>
          チャット
        </Link>
      </div>
      <h2 style={{ fontSize: 14, color: '#5c3a21', marginTop: 28, fontWeight: 700 }}>あなたのOC ({ocs?.length ?? 0} / 5)</h2>
      {(!ocs || ocs.length === 0) && (
        <p style={{ fontSize: 13, color: '#8b7355' }}>まだOCが登録されていません。</p>
      )}
      {ocs && ocs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {ocs.map((oc) => (
            <div
              key={oc.id}
              style={{
                background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3,
                padding: 14, boxShadow: '3px 3px 0 rgba(61,39,23,.15)',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#241a10' }}>{oc.name}</div>
              <div style={{ fontSize: 12, color: '#8b7355', marginTop: 2 }}>
                {oc.oc_type === 'dreamer' ? '夢主' : '創作キャラ'}{oc.house ? ` ・ ${oc.house}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}
      <Link
        href="/ocs/new"
        style={{
          position: 'fixed', right: 20, bottom: 28,
          width: 56, height: 56, borderRadius: 10,
          background: '#8b5a2b', border: '2px solid #3d2717', boxShadow: '0 3px 0 #3d2717',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, color: '#f3e9d8', textDecoration: 'none', lineHeight: 1,
        }}
        aria-label="新しいOCを登録"
      >
        ＋
      </Link>
    </div>
  )
}
