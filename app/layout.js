import { createClient } from '@/lib/supabaseServer'
import { getNotifications } from '@/lib/notifications'
import BottomNav from '@/components/BottomNav'

export const metadata = {
  title: 'うちよそ',
  description: 'うちの子と、よその子と。すれ違いから始まる、二次創作チャット。',
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
          style={{
            maxWidth: 480,
            margin: '0 auto',
            minHeight: '100vh',
            background: '#f3e9d8',
            position: 'relative',
            transform: 'translateZ(0)',
            boxShadow: '0 0 50px rgba(0,0,0,.5)',
          }}
        >
          {children}
          {user && <BottomNav notifications={notifications} />}
        </div>
      </body>
    </html>
  )
}
