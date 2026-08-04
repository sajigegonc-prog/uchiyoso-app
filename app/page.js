import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import LoginButton from './LoginButton'
export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()
    redirect(profile?.onboarding_completed ? '/home' : '/onboarding/name')
  }
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 20% 15%, rgba(139,90,43,.16), transparent 40%), radial-gradient(circle at 80% 85%, rgba(92,58,33,.22), transparent 45%), #241a10',
      color: '#f3e9d8', padding: '0 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 10,
        background: 'linear-gradient(145deg, #c9a876, #8b5a2b 75%)',
        border: '2px solid #5c3a21',
        marginBottom: 18, boxShadow: '0 3px 0 #3d2717, 0 0 24px rgba(139,90,43,.35)',
      }} />
      <h1 style={{ fontSize: 34, letterSpacing: '0.08em', margin: 0 }}>うちよそ</h1>
      <p style={{ fontSize: 13, opacity: 0.7, marginTop: 10, lineHeight: 1.8, maxWidth: 320 }}>
        うちの子と、よその子と。<br />すれ違いから始まる、二次創作チャット。
      </p>
      <LoginButton />
      <p style={{ fontSize: 10, opacity: 0.45, marginTop: 22, lineHeight: 1.7, maxWidth: 320 }}>
        本アプリは個人が制作した非公式のファンメイドアプリです。「ハリー・ポッター」「ウィザーディング・ワールド」の原作者・出版社・映画会社とは一切関係ありません。営利目的の運営は行っておらず、利用料・広告収入等は一切発生していません。
      </p>
    </div>
  )
}
