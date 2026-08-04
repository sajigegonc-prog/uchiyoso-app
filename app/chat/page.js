import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import InvitationRow from './InvitationRow'
import { respondToChatInvitation } from './actions'

export default async function ChatListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: memberships } = await supabase
    .from('chat_room_members')
    .select('room_id, oc_id, left_at, last_read_at, chat_rooms(id, deleted_at, primary_oc_id)')
    .eq('user_id', user.id)
    .is('left_at', null)
  const roomIds = []
  const primaryOcByRoom = new Map()
  const lastReadByRoom = new Map()
  const myOcIdsInRoom = new Map()
  for (const m of memberships || []) {
    if (m.chat_rooms && !m.chat_rooms.deleted_at) {
      roomIds.push(m.chat_rooms.id)
      primaryOcByRoom.set(m.chat_rooms.id, m.chat_rooms.primary_oc_id)
      const existing = lastReadByRoom.get(m.room_id)
      if (!existing || (m.last_read_at && m.last_read_at > existing)) {
        lastReadByRoom.set(m.room_id, m.last_read_at)
      }
      if (!myOcIdsInRoom.has(m.room_id)) myOcIdsInRoom.set(m.room_id, new Set())
      myOcIdsInRoom.get(m.room_id).add(m.oc_id)
    }
  }

  const { data: allMembers } = roomIds.length > 0
    ? await supabase
      .from('chat_room_members')
      .select('room_id, user_id, oc_id, ocs(name, icon_url)')
      .in('room_id', roomIds)
      .is('left_at', null)
    : { data: [] }

  const membersByRoom = new Map()
  for (const m of allMembers || []) {
    if (!membersByRoom.has(m.room_id)) membersByRoom.set(m.room_id, [])
    membersByRoom.get(m.room_id).push(m)
  }

  const lastMessages = {}
  const unreadByRoom = new Map()
  if (roomIds.length > 0) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('room_id, content, sender_oc_id, is_system, created_at')
      .in('room_id', roomIds)
      .order('created_at', { ascending: false })
    const seenForPreview = new Set()
    for (const m of msgs || []) {
      if (!seenForPreview.has(m.room_id) && !m.is_system) {
        lastMessages[m.room_id] = m.content
        seenForPreview.add(m.room_id)
      }
      if (!unreadByRoom.has(m.room_id) && !m.is_system) {
        const myOcs = myOcIdsInRoom.get(m.room_id) || new Set()
        if (!myOcs.has(m.sender_oc_id)) {
          const lastRead = lastReadByRoom.get(m.room_id)
          if (!lastRead || new Date(m.created_at) > new Date(lastRead)) {
            unreadByRoom.set(m.room_id, true)
          } else {
            unreadByRoom.set(m.room_id, false)
          }
        }
      }
    }
  }

  const rooms = roomIds.map((id) => {
    const allInRoom = membersByRoom.get(id) || []
    const primaryOcId = primaryOcByRoom.get(id)
    const otherOcs = allInRoom.filter((m) => m.oc_id !== primaryOcId)
    const displayMembers = otherOcs.length > 0 ? otherOcs : allInRoom
    const title = allInRoom.map((m) => m.ocs?.name).filter(Boolean).join('、')
    return { id, title, displayMembers, unread: unreadByRoom.get(id) || false }
  })

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
              textDecoration: 'none', position: 'relative',
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {room.displayMembers.length === 1 ? (
                <Avatar name={room.displayMembers[0].ocs?.name} iconUrl={room.displayMembers[0].ocs?.icon_url} size={52} />
              ) : (
                <div style={{ position: 'relative', width: 52, height: 52 }}>
                  {room.displayMembers.slice(0, 3).map((m, i) => (
                    <div
                      key={m.user_id + '_' + m.oc_id}
                      style={{
                        position: 'absolute',
                        top: i === 0 ? 0 : 14,
                        left: i === 0 ? 0 : i === 1 ? 20 : 0,
                        border: '2px solid #f3e9d8', borderRadius: '50%',
                      }}
                    >
                      <Avatar name={m.ocs?.name} iconUrl={m.ocs?.icon_url} size={30} />
                    </div>
                  ))}
                </div>
              )}
              {room.unread && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 12, height: 12, borderRadius: '50%',
                  background: '#e0503c', border: '2px solid #f3e9d8',
                }} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#241a10' }}>
                {room.title || '名前未設定'}
              </div>
              <div style={{
                fontSize: 12.5, color: room.unread ? '#241a10' : '#8b7355', fontWeight: room.unread ? 700 : 400, marginTop: 2,
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
