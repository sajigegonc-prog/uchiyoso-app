import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { lightBackLinkStyle } from '../ocs/styles'
import InvitationRow from './InvitationRow'
import { respondToChatInvitation } from './actions'
export default async function ChatListPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const { data: memberships } = await supabase
    .from('chat_room_members')
    .select('room_id, chat_rooms(id, name, location)')
    .eq('user_id', user.id)
  const roomsMap = new Map()
  for (const m of memberships || []) {
    if (m.chat_rooms) roomsMap.set(m.chat_rooms.id, m.chat_rooms)
  }
  const rooms = Array.from(roomsMap.values())
  const { data: invitations } = await supabase.rpc('list_incoming_chat_invitations')
  const { data: myOcs } = await supabase
    .from('ocs')
    .select('id, name')
    .eq('user_id', user.id)
  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh',
      padding: '28px 20px 100px', position: 'relative',
    }}>
      <Link href="/home" style={lightBackLinkStyle}>← ホームに戻る</Link>
      <h1 style={{ fontSize: 18, color: '#241a10', fontWeight: 700, marginTop: 14 }}>チャット</h1>
      {invitations && invitations.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, color: '#5c3a21', fontWeight: 700, marginTop: 22 }}>招待されています</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {invitations.map((inv) => (
              <InvitationRow
                key={inv.invitation_id}
                invitation={inv}
                myOcs={myOcs || []}
                action={respondToChatInvitation}
              />
            ))}
          </div>
        </>
      )}
      <h2 style={{ fontSize: 14, color: '#5c3a21', fontWeight: 700, marginTop: 22 }}>部屋一覧</h2>
      {rooms.length === 0 && (
        <p style={{ fontSize: 13, color: '#8b7355', marginTop: 8 }}>まだ部屋がありません。</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/chat/${room.id}`}
            style={{
              display: 'block', background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3,
              padding: 14, textDecoration: 'none', boxShadow: '3px 3px 0 rgba(61,39,23,.15)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: '#241a10' }}>{room.name || '名前未設定の部屋'}</div>
            {room.location && <div style={{ fontSize: 12, color: '#8b7355', marginTop: 2 }}>📍 {room.location}</div>}
          </Link>
        ))}
      </div>
      <Link
        href="/chat/new"
        style={{
          position: 'fixed', right: 20, bottom: 28,
          width: 56, height: 56, borderRadius: 10,
          background: '#8b5a2b', border: '2px solid #3d2717', boxShadow: '0 3px 0 #3d2717',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, color: '#f3e9d8', textDecoration: 'none', lineHeight: 1,
        }}
        aria-label="新しい部屋を作る"
      >
        ＋
      </Link>
    </div>
  )
}
