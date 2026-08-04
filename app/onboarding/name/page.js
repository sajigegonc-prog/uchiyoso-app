import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { updateDisplayName } from './actions'
import SubmitButton from '@/components/SubmitButton'
import { onboardingPageStyle, cardStyle, logoStyle, fieldLabelStyle, inputStyle, btnStyle } from '../styles'
export default async function NameSetupPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, onboarding_completed')
    .eq('id', user.id)
    .single()
  if (profile?.onboarding_completed) redirect('/home')
  return (
    <div style={onboardingPageStyle}>
      <div style={cardStyle}>
        <div style={logoStyle} />
        <h1 style={{ fontSize: 22, margin: 0 }}>表示名を確認</h1>
        <p style={{ fontSize: 13, opacity: 0.65, marginTop: 10, lineHeight: 1.8 }}>
          Googleアカウントの名前を仮の表示名にしています。<br />そのままでも、変更してもOKです。
        </p>
        <form action={updateDisplayName} style={{ marginTop: 28, textAlign: 'left' }}>
          <label style={fieldLabelStyle}>表示名</label>
          <input name="display_name" defaultValue={profile?.display_name || ''} style={inputStyle} />
          <SubmitButton style={btnStyle} pendingText="保存中…">次へ</SubmitButton>
        </form>
      </div>
    </div>
  )
}
