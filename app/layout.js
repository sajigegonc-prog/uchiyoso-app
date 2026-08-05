import { createClient } from '@/lib/supabaseServer'
import { getNotifications } from '@/lib/notifications'
import BottomNav from '@/components/BottomNav'
import PullToRefresh from '@/components/PullToRefresh'

export const metadata = {
  title: 'ウィザワ向けうちよそ通信クラブ',
  description: '全うちよそ魔人に捧げます。',
}

export default async function RootLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let notifications = { chat: false, owl: false, matching: false }
  if (user) {
    notifications = await getNotifications(supabase, user.id)
  }

  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, interactive-widget=resizes-content" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html, body { max-width: 100%; overflow-x: hidden; overscroll-behavior-x: none; }
          input, select, textarea { max-width: 100%; width: 100%; }
          .chat-room-height {
            height: calc(100vh - 60px);
            height: calc(100dvh - 60px);
          }
          .app-shell {
            min-height: 100vh;
            min-height: 100dvh;
          }
          @keyframes fadeInNotice {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in-notice {
            opacity: 0;
            animation: fadeInNotice .7s ease forwards;
          }
        `}</style>
      </head>
      <body style={{ margin: 0, fontFamily: "'BIZ UDPGothic', sans-serif", background: '#1a120b' }}>
        <div
          className="app-shell"
          style={{
            maxWidth: 480,
            margin: '0 auto',
            background: '#f3e9d8',
            position: 'relative',
            transform: 'translateZ(0)',
            boxShadow: '0 0 50px rgba(0,0,0,.5)',
          }}
        >
          <PullToRefresh />
          {children}
        </div>
        {user && (
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50 }}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <BottomNav notifications={notifications} />
            </div>
          </div>
        )}
      </body>
    </html>
  )
}
