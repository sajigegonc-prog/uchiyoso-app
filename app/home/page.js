import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { getNotifications } from '@/lib/notifications'
import CoachMark from '@/components/CoachMark'
import { markHomeTutorialSeen } from '../tutorialActions'
import { signOutOnly } from '../dev/reset/actions'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, onboarding_completed, seen_home_tutorial')
    .eq('id', user.id)
    .single()
  if (!profile?.onboarding_completed) {
    redirect('/onboarding/name')
  }
  const notifications = await getNotifications(supabase, user.id)

  const today = new Date()
  const dateline = today.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })

  const noticeItems = [
    notifications.chat && { href: '/chat', text: 'あなたに話しかけた人がいるようです' },
    notifications.owl && { href: '/owl', text: 'あなたの部屋にフクロウが来ています' },
    notifications.matching && { href: '/chat', text: 'あなたと偶然すれ違った方がいるようです' },
  ].filter(Boolean)

  return (
    <>
      {!profile?.seen_home_tutorial && (
        <CoachMark
          steps={[
            { text: 'ここがあなたのホーム画面です。届いた便りは、ここに速報として並びます。' },
            { targetId: 'coach-replay-link', text: '場面転換で発行したログを貼ると、チャット画面風に再現して見返せます。' },
            { targetId: 'coach-bottomnav', text: 'ここから遊べます。' },
          ]}
          onFinish={markHomeTutorialSeen}
        />
      )}
      <div style={{
        fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh',
        padding: '24px 20px 100px',
      }}>
        <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
          <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
          <div style={{ fontSize: 28, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
            ホーム
          </div>
          <div style={{ fontSize: 9.5, color: '#8a8168', marginTop: 8, letterSpacing: '.1em' }}>
            {dateline}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22 }}>
          <svg width="30" height="38" viewBox="0 0 30 38" fill="none" style={{ flexShrink: 0 }}>
            <path d="M15 4 C13 8 11 10 11 13 C11 15.2 12.8 17 15 17 C17.2 17 19 15.2 19 13 C19 10 17 8 15 4 Z" stroke="#211d17" strokeWidth="1" fill="none" />
            <line x1="15" y1="17" x2="15" y2="21" stroke="#211d17" strokeWidth="1" />
            <rect x="10" y="21" width="10" height="13" stroke="#211d17" strokeWidth="1" fill="none" />
            <line x1="8" y1="34" x2="22" y2="34" stroke="#211d17" strokeWidth="1.2" />
          </svg>
          <div>
            <p style={{ fontSize: 14, color: '#3d2717', fontStyle: 'italic', lineHeight: 1.6 }}>
              ようこそ、{profile?.display_name || user.email} さん。
            </p>
            <p style={{ fontSize: 12, color: '#6b6250', fontStyle: 'italic', marginTop: 2 }}>
              ここはあなたの寝室です。
            </p>
          </div>
        </div>

        {noticeItems.length > 0 ? (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 11, letterSpacing: '.15em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6 }}>
              速報
            </div>
            {noticeItems.map((item, i) => (
              <Link
                key={item.href + i}
                href={item.href}
                className="fade-in-notice"
                style={{
                  display: 'block', padding: '13px 2px', borderBottom: '1px solid #211d17',
                  textDecoration: 'none', color: '#211d17', fontSize: 13, lineHeight: 1.6,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                {item.text}
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12.5, color: '#8a8168', marginTop: 24, fontStyle: 'italic', textAlign: 'center' }}>
            — 新しい報せはありません —
          </p>
        )}

        <Link
          id="coach-replay-link"
          href="/replay"
          style={{
            display: 'block', textAlign: 'center', marginTop: 30,
            background: '#fff', color: '#211d17', fontWeight: 700, fontSize: 12.5,
            border: '1px solid #211d17', padding: 11, textDecoration: 'none', letterSpacing: '.05em',
          }}
        >
          過去のおしゃべりを思い出す
        </Link>

        <form action={signOutOnly} style={{ marginTop: 40, textAlign: 'center' }}>
          <button type="submit" style={{ background: 'none', border: 'none', color: '#8a8168', fontSize: 11.5, textDecoration: 'underline', cursor: 'pointer', fontStyle: 'italic' }}>
            ログアウト
          </button>
        </form>
      </div>
    </>
  )
}
