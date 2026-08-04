import { createClient } from '@/lib/supabaseServer'
import { getNotifications } from '@/lib/notifications'
import BottomNav from '@/components/BottomNav'

export const metadata = {
  title: 'うちよそ',
  description: 'うちの子と、よその子と。すれ違いから始まる、二次創作チャット。',
}

export default async function RootLayout({ children }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  let notifications = { chat: false, owl: false, matching: false }
  if (user) {
    notifications = await getNotifications(supabase, user.id)
  }

  return (
    <html lang="ja">
      <head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html, body { max-width: 100%; overflow-x: hidden; overscroll-behavior-x: none; }
          input, select, textarea { max-width: 100%; width: 100%; }
        `}</style>
      </head>
      <body style={{ margin: 0, fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8' }}>
        {children}
        {user && <BottomNav notifications={notifications} />}
      </body>
    </html>
  )
}
