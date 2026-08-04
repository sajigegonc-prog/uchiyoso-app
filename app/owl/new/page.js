import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { sendLetter } from '../actions'
import RecipientSelect from './RecipientSelect'
import { lightBackLinkStyle } from '../../ocs/styles'

export default async function NewLetterPage() {
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

  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id, status')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  const friendUserIds = (friendships || []).map((f) => f.requester_id === user.id ? f.addressee_id : f.requester_id)

  if (friendUserIds.length > 0) {
    const { data: friendProfiles } = await supabase.from('profiles').select('id, display_name').in('id', friendUserIds)
    const { data: friendOcs } = await supabase.from('ocs').select('id, name, user_id').in('user_id', friendUserIds)
    for (const profile of friendProfiles || []) {
      const ocsForFriend = (friendOcs || []).filter((oc) => oc.user_id === profile.id)
      if (ocsForFriend.length > 0) {
        recipients.push({ label: profile.display_name || '名前未設定', ocs: ocsForFriend })
      }
    }
  }

  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh',
      padding: '28px 20px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <Link href="/owl" style={lightBackLinkStyle}>← ふくろう便に戻る</Link>
        <h1 style={{ fontSize: 18, color: '#241a10', fontWeight: 700, marginTop: 14 }}>手紙を送る</h1>
      </div>
      {(!myOcs || myOcs.length === 0) ? (
        <p style={{ fontSize: 13, color: '#8b7355', marginTop: 20 }}>先にOCを登録してください。</p>
      ) : (
        <RecipientSelect action={sendLetter} myOcs={myOcs} recipients={recipients} />
      )}
    </div>
  )
}
