import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { createRoom } from '../actions'
import NewRoomForm from './NewRoomForm'
import { lightBackLinkStyle } from '../../ocs/styles'
import Link from 'next/link'
export default async function NewChatPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const { data: ocs } = await supabase
    .from('ocs')
    .select('id, name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  const { data: friends } = await supabase.rpc('list_my_friends')
  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh',
      padding: '28px 20px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <Link href="/chat" style={lightBackLinkStyle}>← チャット一覧に戻る</Link>
        <h1 style={{ fontSize: 18, color: '#241a10', fontWeight: 700, marginTop: 14, marginBottom: 4 }}>
          新しい部屋を作る
        </h1>
      </div>
      {(!ocs || ocs.length === 0) ? (
        <p style={{ fontSize: 13, color: '#8b7355', marginTop: 20, maxWidth: 360, textAlign: 'center' }}>
          チャットを作るには、まずOCを1人登録してください。
        </p>
      ) : (
        <NewRoomForm action={createRoom} ocs={ocs} friends={friends || []} />
      )}
    </div>
  )
}
