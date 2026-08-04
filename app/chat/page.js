import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
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

  const roomIds = rooms.map((r) => r.id)
  const lastMessages = {}
  if (roomIds.length > 0) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('room_id, content, created_at')
      .in('room_id', roomIds)
      .order('created_at', { ascending: false })
    for (const m of msgs || []) {
      if (!lastMessages[m.room_id]) lastMessages[m.room_id] = m.content
    }
  }

  const { data: invitations } = await supabase.rpc('list_incoming_chat_invitations')
  const { data: myOcs } = await supabase
    .from('ocs')
    .select('id, name')
    .eq('user_id', user.id)

  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh',
      padding: '24px 20px 100px', position: 'relative',
    }}>
      <h1 style={{ fontSize: 20, color: '#241a10', fontWeight: 700 }}>チャット</h1>

      <Link
        href="/chat/new"
        style={{
          display: 'block', textAlign: 'center', marginTop: 16,
          background: '#8b5a2b', color: '#f3e9d8', fontWeight: 700, fontSize: 14,
          borderRadius: 3, padding: 14, textDecoration: 'none',
        }}
      >
        ＋ 新しい部屋を作る
      </Link>

      {invitations && invitations.length > 0 && (
        <>
          <h2 style={{ fontSize: 13, color: '#5c3a21', fontWeight: 700, marginTop: 22 }}>招待されています</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {invitations.map((inv) => (
              <InvitationRow key={inv.invitation_id} invitation={inv} myOcs={myOcs || []} action={respondToChatInvitation} />
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 20 }}>
        {rooms.length === 0 && (
          <p style={{ fontSize: 13, color: '#8b7355', marginTop: 20 }}>まだ部屋がありません。</p>
        )}
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/chat/${room.id}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 4px', borderBottom: '1px solid #d8c7ac',
              textDecoration: 'none',
            }}
          >
            <Avatar name={room.name || '部屋'} size={52} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#241a10' }}>
                {room.name || '名前未設定の部屋'}
              </div>
              <div style={{
                fontSize: 12.5, color: '#8b7355', marginTop: 2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {lastMessages[room.id] || 'まだメッセージがありません'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
