'use client'
import { createClient } from '@/lib/supabaseClient'
import { useT } from '@/lib/i18n/client'
export default function LoginButton() {
  const t = useT()
  const supabase = createClient()
  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }
  return (
    <button
      onClick={handleLogin}
      style={{
        width: '100%', padding: 12, border: '1px solid #f4eee0',
        fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 30,
        background: '#f4eee0', color: '#211d17', letterSpacing: '.05em',
      }}
    >
      {t('Google でログイン / 新規登録')}
    </button>
  )
}
