import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import InvitationRow from './InvitationRow'
import { respondToChatInvitation } from './actions'
import AutoRefresh from '@/components/AutoRefresh'
import Image from 'next/image'

export default async function ChatListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: memberships } = await supabase
    .from('chat_room_members')
    .select('room_id, oc_id, left_at, last_read_at, ooc_last_read_at, .select('room_id, oc_id, left_at, last_read_at, ooc_last_read_at, chat_rooms(id, deleted_at, primary_oc_id, title)')')
    .eq('user_id', user.id)
    .is('left_at', null)
  const roomIdSet = new Set()
  const roomIds = []
  const primaryOcByRoom = new Map()
  const customTitleByRoom = new Map()
  const lastReadByRoom = new Map()
  const oocLastReadByRoom = new Map()
  const myOcIdsInRoom = new Map()
  for (const m of memberships || []) {
    if (m.chat_rooms && !m.chat_rooms.deleted_at) {
      if (!roomIdSet.has(m.chat_rooms.id)) {
        roomIdSet.add(m.chat_rooms.id)
        roomIds.push(m.chat_rooms.id)
      }
      primaryOcByRoom.set(m.chat_rooms.id, m.chat_rooms.primary_oc_id)
      customTitleByRoom.set(m.chat_rooms.id, m.chat_rooms.title)
      const existing = lastReadByRoom.get(m.room_id)
      if (!existing || (m.last_read_at && m.last_read_at > existing)) {
        lastReadByRoom.set(m.room_id, m.last_read_at)
      }
      const existingOoc = oocLastReadByRoom.get(m.room_id)
      if (!existingOoc || (m.ooc_last_read_at && m.ooc_last_read_at > existingOoc)) {
        oocLastReadByRoom.set(m.room_id, m.ooc_last_read_at)
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
  const uniqueUsersByRoom = new Map()
  for (const m of allMembers || []) {
    if (!membersByRoom.has(m.room_id)) membersByRoom.set(m.room_id, [])
    membersByRoom.get(m.room_id).push(m)
    if (!uniqueUsersByRoom.has(m.room_id)) uniqueUsersByRoom.set(m.room_id, new Set())
    uniqueUsersByRoom.get(m.room_id).add(m.user_id)
  }
  const selfOnlyRooms = new Set(roomIds.filter((id) => (uniqueUsersByRoom.get(id)?.size || 1) <= 1))

  const lastMessages = {}
  const lastActivityByRoom = new Map()
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
      const existingActivity = lastActivityByRoom.get(m.room_id)
      if (!existingActivity || m.created_at > existingActivity) {
        lastActivityByRoom.set(m.room_id, m.created_at)
      }
      if (!unreadByRoom.has(m.room_id) && !m.is_system) {
        if (selfOnlyRooms.has(m.room_id)) {
          unreadByRoom.set(m.room_id, false)
          continue
        }
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

  const unreadOocByRoom = new Map()
  if (roomIds.length > 0) {
    const { data: oocMsgs } = await supabase
      .from('room_ooc_messages')
      .select('room_id, user_id, created_at')
      .in('room_id', roomIds)
      .order('created_at', { ascending: false })
    const seenOoc = new Set()
    for (const m of oocMsgs || []) {
      if (seenOoc.has(m.room_id)) continue
      seenOoc.add(m.room_id)
      const existingActivity = lastActivityByRoom.get(m.room_id)
      if (!existingActivity || m.created_at > existingActivity) {
        lastActivityByRoom.set(m.room_id, m.created_at)
      }
      if (selfOnlyRooms.has(m.room_id)) continue
      if (m.user_id === user.id) continue
      const lastRead = oocLastReadByRoom.get(m.room_id)
      if (!lastRead || new Date(m.created_at) > new Date(lastRead)) {
        unreadOocByRoom.set(m.room_id, true)
      }
    }
  }

  const rooms = roomIds.map((id) => {
    const allInRoom = membersByRoom.get(id) || []
    const primaryOcId = primaryOcByRoom.get(id)
    const otherOcs = allInRoom.filter((m) => m.oc_id !== primaryOcId)
    const displayMembers = otherOcs.length > 0 ? otherOcs : allInRoom
    const title = customTitleByRoom.get(id) || allInRoom.map((m) => m.ocs?.name).filter(Boolean).join('、')
    return {
      id, title, displayMembers,
      unread: unreadByRoom.get(id) || false,
      unreadOoc: unreadOocByRoom.get(id) || false,
    }
  })

  rooms.sort((a, b) => {
    const ta = lastActivityByRoom.get(a.id) ? new Date(lastActivityByRoom.get(a.id)).getTime() : 0
    const tb = lastActivityByRoom.get(b.id) ? new Date(lastActivityByRoom.get(b.id)).getTime() : 0
    return tb - ta
  })

  const { data: invitations } = await supabase.rpc('list_incoming_chat_invitations')

  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh',
      padding: '24px 20px 110px',
    }}>
      <AutoRefresh intervalMs={4000} />
      <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 26, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
          おしゃべりする
        </div>
      </div>

      <Link
        href="/chat/new"
        style={{
          display: 'block', textAlign: 'center', marginTop: 18,
          background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 13,
          padding: 13, textDecoration: 'none', letterSpacing: '.05em',
        }}
      >
        + 新しい部屋を作る
      </Link>
      <div
        style={{
          display: 'block', textAlign: 'center', marginTop: 10,
          background: '#d8cdb0', color: '#8a8168', fontWeight: 700, fontSize: 13,
          padding: 13, letterSpacing: '.05em', cursor: 'default',
        }}
      >
        ランダムマッチング(近日公開予定)
      </div>

      {invitations && invitations.length > 0 && (
        <>
          <div style={{ fontSize: 11, letterSpacing: '.15em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 24 }}>
            招待されています
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {invitations.map((inv) => (
              <InvitationRow key={inv.invitation_id} invitation={inv} action={respondToChatInvitation} />
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 22 }}>
        {rooms.length === 0 && (
          <p style={{ fontSize: 13, color: '#8a8168', marginTop: 20, fontStyle: 'italic', textAlign: 'center' }}>
            まだ部屋がありません。
          </p>
        )}
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/chat/${room.id}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '15px 2px', borderBottom: '1px solid #211d17',
              textDecoration: 'none', position: 'relative',
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {room.displayMembers.length === 1 ? (
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', overflow: 'hidden',
                  background: '#211d17', border: '1px solid #211d17',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f4eee0', fontWeight: 700, fontSize: 16, fontFamily: 'Georgia, serif',
                  position: 'relative',
                }}>
                  {room.displayMembers[0].ocs?.icon_url ? (
                    <Image src={room.displayMembers[0].ocs.icon_url} alt="" fill sizes="48px" style={{ objectFit: 'cover' }} />
                  ) : room.displayMembers[0].ocs?.name?.charAt(0)}
                </div>
              ) : (
                <div style={{ position: 'relative', width: 48, height: 48 }}>
                  {room.displayMembers.slice(0, 3).map((m, i) => (
                    <div
                      key={m.user_id + '_' + m.oc_id}
                      style={{
                        position: 'absolute',
                        top: i === 0 ? 0 : 14,
                        left: i === 0 ? 0 : i === 1 ? 20 : 0,
                        width: 30, height: 30, borderRadius: '50%', overflow: 'hidden',
                        background: '#211d17', border: '2px solid #f4eee0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#f4eee0', fontWeight: 700, fontSize: 12, fontFamily: 'Georgia, serif',
                      }}
                    >
                      {m.ocs?.icon_url ? (
                        <Image src={m.ocs.icon_url} alt="" fill sizes="30px" style={{ objectFit: 'cover' }} />
                      ) : m.ocs?.name?.charAt(0)}
                    </div>
                  ))}
                </div>
              )}
              {(room.unread || room.unreadOoc) && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 11, height: 11, borderRadius: '50%',
                  background: '#8a2418', border: '2px solid #f4eee0',
                }} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                {room.title || '名前未設定'}
                {room.unreadOoc && (
                  <span style={{ fontSize: 9, color: '#4a5580', border: '1px solid #4a5580', padding: '1px 6px', fontFamily: "'BIZ UDPGothic', sans-serif", fontWeight: 700 }}>
                    中の人
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 12, color: room.unread ? '#211d17' : '#8a8168', fontStyle: 'italic', marginTop: 3,
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
