import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { createFirstOC, skipOnboarding } from './actions'
import OCForm from './OCForm'
import SubmitButton from '@/components/SubmitButton'
import { onboardingPageStyle, cardStyle, logoStyle, skipLinkStyle } from '../styles'
export default async function OnboardingCharacterPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()
  if (profile?.onboarding_completed) redirect('/home')
  return (
    <div style={onboardingPageStyle}>
      <div style={cardStyle}>
        <div style={logoStyle} />
        <h1 style={{ fontSize: 22, margin: 0 }}>ようこそ!</h1>
        <p style={{ fontSize: 13, opacity: 0.65, marginTop: 10, lineHeight: 1.8 }}>
          はじめる前に、まずはあなたのOCを<br />1人登録しましょう。
        </p>
      </div>
      <OCForm action={createFirstOC} />
      <form action={skipOnboarding}>
        <SubmitButton style={skipLinkStyle} pendingText="処理中…">あとで登録する</SubmitButton>
      </form>
      <p style={{ fontSize: 11, opacity: 0.4, textAlign: 'center', maxWidth: 320, marginTop: 4 }}>
        他の項目(アイコン画像など)は、あとからOC一覧で編集できます。
      </p>
    </div>
  )
}
