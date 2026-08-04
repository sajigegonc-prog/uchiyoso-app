'use client'
import { createClient } from '@/lib/supabaseClient'
export default function LoginButton() {
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
        width: '100%', maxWidth: 320, padding: 13, borderRadius: 3, border: '2px solid #3d2717',
        fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 32,
        background: '#f3e9d8', color: '#241a10', boxShadow: '0 3px 0 #3d2717',
      }}
    >
      Google でログイン / 新規登録
    </button>
  )
}
