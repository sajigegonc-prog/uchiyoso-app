import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { createRoom } from '../actions'
import NewRoomForm from './NewRoomForm'
import Link from 'next/link'

export default async function NewChatPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
    const { data: ocs } = await supabase
    .from('ocs')
    .select('id, name, icon_url')
    .eq('user_id', user.id)
    .eq('is_dream_partner', false)
    .order('created_at', { ascending: true })
  const { data: dreamPartner } = await supabase
    .from('ocs')
    .select('id, name, icon_url')
    .eq('user_id', user.id)
    .eq('is_dream_partner', true)
    .maybeSingle()
  const { data: friendOcs } = await supabase.rpc('list_friend_ocs')

  const initialFriendOcId = searchParams?.friend_oc_id

  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh',
      padding: '24px 20px 110px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO CLUB</div>
        <div style={{ fontSize: 24, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
          誰かとおしゃべりする！
        </div>
      </div>
      {(!ocs || ocs.length === 0) ? (
        <p style={{ fontSize: 13, color: '#8a8168', marginTop: 24, maxWidth: 360, textAlign: 'center', fontStyle: 'italic' }}>
          おしゃべりするには、まずOCを1人登録してください。
        </p>
      ) : (
        <NewRoomForm
          ocs={ocs}
          friendOcs={friendOcs || []}
          initialFriendOcId={initialFriendOcId}
          dreamPartner={dreamPartner}
        />
      )}
      <Link href="/chat" style={{ display: 'block', marginTop: 24, marginBottom: 10, padding: '10px 0', textAlign: 'center', fontSize: 11.5, color: '#6b6250', textDecoration: 'none' }}>
        ← おしゃべり一覧に戻る
      </Link>
    </div>
  )
}
