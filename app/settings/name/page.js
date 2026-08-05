import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { updateDisplayNameLimited } from '../actions'
import NameChangeForm from './NameChangeForm'

export default async function NameSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px 60px' }}>
      <Link href="/home" style={{ fontSize: 11, color: '#6b6250', textDecoration: 'none' }}>← ホームに戻る</Link>
      <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17', marginTop: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 22, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>表示名の変更</div>
      </div>
      <NameChangeForm action={updateDisplayNameLimited} currentName={profile?.display_name || ''} />
    </div>
  )
}
