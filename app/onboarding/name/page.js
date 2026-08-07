import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { updateDisplayName } from './actions'
import SubmitButton from '@/components/SubmitButton'

export default async function NameSetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, onboarding_completed')
    .eq('id', user.id)
    .single()
  if (profile?.onboarding_completed) redirect('/home')
  return (
    <div style={{
      minHeight: '100vh', background: '#211d17',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 30,
    }}>
      <div style={{ border: '1px solid #f4eee0', padding: '30px 20px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: '.15em', color: '#a39a80' }}>THE UCHIYOSO CLUB</div>
        <div style={{
          fontSize: 20, fontWeight: 700, fontFamily: 'Georgia, serif', color: '#f4eee0',
          marginTop: 14, borderTop: '3px double #f4eee0', borderBottom: '3px double #f4eee0', padding: '14px 0',
        }}>
          表示名を確認
        </div>
        <p style={{ fontSize: 11.5, color: '#a39a80', marginTop: 14, lineHeight: 1.8, fontStyle: 'italic' }}>
          Googleアカウントの名前を仮の表示名にしています。<br />そのままでも、変更してもOKです。
        </p>
        <form action={updateDisplayName} style={{ marginTop: 24, textAlign: 'left' }}>
          <label style={{ fontSize: 11, color: '#a39a80', display: 'block', marginBottom: 6, letterSpacing: '.05em' }}>表示名</label>
          <input
            name="display_name"
            defaultValue={profile?.display_name || ''}
            style={{
              width: '100%', padding: '11px 13px', fontSize: 15,
              background: 'rgba(255,255,255,.06)', border: '1px solid #a39a80', color: '#f4eee0',
              boxSizing: 'border-box',
            }}
          />
          <SubmitButton
            style={{
              width: '100%', padding: 12, border: '1px solid #f4eee0',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 20,
              background: '#f4eee0', color: '#211d17', letterSpacing: '.05em',
            }}
            pendingText="保存中…"
          >
            次へ
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}
