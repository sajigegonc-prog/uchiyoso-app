import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import LoginButton from './LoginButton'
import PrivacyPolicyModal from './PrivacyPolicyModal'
import CreditsModal from './CreditsModal'

export const metadata = {
  title: 'うちよそクラブ',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/home')

  return (
    <div style={{
      minHeight: '100vh', background: '#211d17',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 30,
    }}>
      <div style={{ border: '1px solid #f4eee0', padding: '30px 20px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: '.15em', color: '#a39a80' }}>月刊創作者新聞 presents</div>
        <div style={{
          fontSize: 22, fontWeight: 700, fontFamily: 'Georgia, serif', color: '#f4eee0',
          marginTop: 14, borderTop: '3px double #f4eee0', borderBottom: '3px double #f4eee0', padding: '14px 0',
        }}>
          うちよそクラブ
        </div>
        <div style={{ fontSize: 11, color: '#a39a80', marginTop: 14, fontStyle: 'italic', lineHeight: 1.8 }}>
          紳士、淑女、そしてゴーストの皆さん、<br />全てのうちよそ魔人に捧げます。
        </div>
        <LoginButton />
        <p style={{ fontSize: 9, color: '#7a7160', marginTop: 26, lineHeight: 1.8 }}>
          本アプリは個人が制作した非公式のファンメイドアプリです。<br />
          「ハリー・ポッター」「ウィザーディング・ワールド」の<br />
          原作者・出版社・映画会社等とは一切関係ありません。<br />
          営利目的の運営ではなく、利用料・広告収入等は一切発生していません。<br />
          権利者様からのご連絡があった場合、速やかに削除いたします。<br />
          また、利用者間で生じたトラブルについて、運営者は責任を負いかねますのでご了承ください。
        </p>
        <PrivacyPolicyModal />
        <CreditsModal />
      </div>
    </div>
  )
}
