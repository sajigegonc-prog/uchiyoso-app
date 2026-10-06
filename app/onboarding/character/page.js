import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { createFirstOC, skipOnboarding } from './actions'
import OCForm from './OCForm'
import SubmitButton from '@/components/SubmitButton'
import { getT } from '@/lib/i18n/server'

export default async function OnboardingCharacterPage() {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()
  if (profile?.onboarding_completed) redirect('/home')
  return (
    <div style={{
      minHeight: '100vh', background: '#211d17',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '30px 20px 60px',
    }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: '.15em', color: '#a39a80' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{
          fontSize: 20, fontWeight: 700, fontFamily: 'Georgia, serif', color: '#f4eee0',
          marginTop: 14, borderTop: '3px double #f4eee0', borderBottom: '3px double #f4eee0', padding: '14px 0',
        }}>
          {t('ようこそ！')}
        </div>
        <p style={{ fontSize: 11.5, color: '#a39a80', marginTop: 14, lineHeight: 1.8, fontStyle: 'italic' }}>
          {t('はじめる前に、まずはあなたのOCを')}<br />{t('1人登録しましょう。')}
        </p>
      </div>
      <OCForm action={createFirstOC} userId={user.id} />
      <form action={skipOnboarding} style={{ marginTop: 16 }}>
        <SubmitButton
          style={{
            background: 'none', border: 'none', color: '#a39a80', fontSize: 12, textDecoration: 'underline',
            cursor: 'pointer',
          }}
          pendingText={t('処理中…')}
        >
          {t('あとで登録する')}
        </SubmitButton>
      </form>
      <p style={{ fontSize: 10, color: '#7a7160', textAlign: 'center', maxWidth: 320, marginTop: 6, lineHeight: 1.7 }}>
        {t('他の項目(アイコン画像など)は、あとからOC一覧で編集できます。')}
      </p>
    </div>
  )
}
