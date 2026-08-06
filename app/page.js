import LoginButton from './LoginButton'

export const metadata = {
  title: 'うちよそクラブ',
}

export default function LoginPage() {
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
      </div>
    </div>
  )
}
