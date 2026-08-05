import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { sendLetter } from '../actions'
import RecipientSelect from './RecipientSelect'

export default async function NewLetterPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: myOcs } = await supabase
    .from('ocs')
    .select('id, name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const recipients = []
  if ((myOcs || []).length > 1) {
    recipients.push({ label: '自分の他のOC', ocs: myOcs })
  }

  const { data: friendOcs } = await supabase.rpc('list_friend_ocs')
  const groups = new Map()
  for (const f of friendOcs || []) {
    const key = f.friend_display_name || '名前未設定'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push({ id: f.oc_id, name: f.oc_name })
  }
  for (const [label, ocs] of groups) {
    recipients.push({ label, ocs })
  }

  const initialSenderOcId = searchParams?.from
  const initialRecipientOcId = searchParams?.to

  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh',
      padding: '24px 20px 110px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 24, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
          手紙を送る
        </div>
      </div>
      {(!myOcs || myOcs.length === 0) ? (
        <p style={{ fontSize: 13, color: '#8a8168', marginTop: 20, fontStyle: 'italic' }}>先にOCを登録してください。</p>
      ) : (
        <RecipientSelect
          action={sendLetter}
          myOcs={myOcs}
          recipients={recipients}
          initialSenderOcId={initialSenderOcId}
          initialRecipientOcId={initialRecipientOcId}
        />
      )}
      <Link href="/owl" style={{ display: 'block', marginTop: 24, marginBottom: 10, padding: '10px 0', textAlign: 'center', fontSize: 11.5, color: '#6b6250', textDecoration: 'none' }}>
        ← ふくろう便に戻る
      </Link>
    </div>
  )
}
