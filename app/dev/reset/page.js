import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { resetAccount, signOutAndReset, signOutOnly } from './actions'
import SubmitButton from '@/components/SubmitButton'
export default async function DevResetPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  const btnPrimary = {
    width: '100%', padding: 13, borderRadius: 3, border: '2px solid #3d2717',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    background: '#8b5a2b', color: '#f3e9d8', boxShadow: '0 3px 0 #3d2717',
  }
  const btnSecondary = {
    ...btnPrimary, background: '#fbf5e9', color: '#241a10', border: '2px solid #8b6a4a',
    boxShadow: 'none', marginTop: 10,
  }
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', padding: '0 24px', textAlign: 'center',
    }}>
      <h1 style={{ fontSize: 18, color: '#241a10' }}>開発用リセット</h1>
      <p style={{ fontSize: 13, color: '#8b7355', marginTop: 8, lineHeight: 1.8 }}>
        {user ? `${user.email} でログイン中` : '未ログイン'}
      </p>
      <form action={signOutAndReset} style={{ marginTop: 24, width: '100%', maxWidth: 280 }}>
        <SubmitButton style={btnPrimary} pendingText="処理中…">ログアウト+データを全リセット</SubmitButton>
        <p style={{ fontSize: 11, color: '#b3a98f', marginTop: 6 }}>
          同じGoogleアカウントで、最初のログイン画面からやり直せます
        </p>
      </form>
      <form action={resetAccount} style={{ marginTop: 18, width: '100%', maxWidth: 280 }}>
        <SubmitButton style={btnSecondary} pendingText="処理中…">データだけリセット(ログイン維持)</SubmitButton>
      </form>
      <form action={signOutOnly} style={{ marginTop: 10, width: '100%', maxWidth: 280 }}>
        <SubmitButton style={btnSecondary} pendingText="処理中…">ログアウトのみ</SubmitButton>
      </form>
    </div>
  )
}
