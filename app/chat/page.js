import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import InvitationRow from './InvitationRow'
import { respondToChatInvitation } from './actions'
import RealtimeRefresh from '@/components/AutoRefresh'
import CoachMark from '@/components/CoachMark'
import { markUpdate1TutorialSeen } from '../tutorialActions'
import Image from 'next/image'

export default async function ChatListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: tutorialProfile } = await supabase
    .from('profiles')
    .select('seen_update1_tutorial')
    .eq('id', user.id)
    .maybeSingle()
  const showUpdate1Tutorial = !tutorialProfile?.seen_update1_tutorial

  const { data: memberships } = await supabase
    .from('chat_room_members')
    .select('room_id, oc_id, left_at, last_read_at, ooc_last_read_at, chat_rooms(id, deleted_at, primary_oc_id, title)')
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

  const { data: pendingOutgoing } = roomIds.length > 0
    ? await supabase
      .from('chat_room_invitations')
      .select('room_id, ocs:invitee_oc_id(name)')
      .in('room_id', roomIds)
      .eq('status', 'pending')
    : { data: [] }
  const pendingRoomIds = new Set((pendingOutgoing || []).map((p) => p.room_id))
  const pendingNamesByRoom = new Map()
  for (const p of pendingOutgoing || []) {
    if (!pendingNamesByRoom.has(p.room_id)) pendingNamesByRoom.set(p.room_id, [])
    if (p.ocs?.name) pendingNamesByRoom.get(p.room_id).push(p.ocs.name)
  }

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
      .select('room_id, content, sender_oc_id, is_system, created_at, deleted_at')
      .in('room_id', roomIds)
      .order('created_at', { ascending: false })
    const seenForPreview = new Set()
    for (const m of msgs || []) {
      if (!seenForPreview.has(m.room_id) && !m.is_system && !m.deleted_at) {
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
    const customTitle = customTitleByRoom.get(id) || null
    const joinedNames = allInRoom.map((m) => m.ocs?.name).filter(Boolean)
    const pendingNames = pendingNamesByRoom.get(id) || []
    return {
      id, customTitle, displayMembers, joinedNames, pendingNames,
      unread: unreadByRoom.get(id) || false,
      unreadOoc: unreadOocByRoom.get(id) || false,
      pending: pendingRoomIds.has(id),
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
      <RealtimeRefresh tables={['messages', 'room_ooc_messages', 'chat_room_invitations', 'chat_room_members']} fallbackMs={15000} />
      {showUpdate1Tutorial && (
        <CoachMark
          steps={[
            { targetId: 'coach-random-btn', text: '友達の中からランダムでお相手が決まる新機能です。まだ話したことのない友達と、シチュエーション付きでお話を始められます。' },
          ]}
          onFinish={markUpdate1TutorialSeen}
        />
      )}
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
        + 誰かとおしゃべりする！
      </Link>
      <Link
        id="coach-random-btn"
        href="/chat/random"
        style={{
          display: 'block', textAlign: 'center', marginTop: 10,
          background: '#d8cdb0', color: '#3d2717', fontWeight: 700, fontSize: 11,
          padding: 8, letterSpacing: '.05em', textDecoration: 'none',
        }}
      >
        話したことない友達とおしゃべりしてみる
      </Link>

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
              {room.pending ? (
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: '#d8cdb0', border: '1px solid #8a8168',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="4" stroke="#8a8168" strokeWidth="1.2" />
                    <path d="M3 19c0-4 3-7 7-7s7 3 7 7" stroke="#8a8168" strokeWidth="1.2" />
                  </svg>
                </div>
              ) : room.displayMembers.length === 1 ? (
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
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: '#211d17', border: '1px solid #211d17',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
                    <circle cx="8" cy="6" r="4" stroke="#f4eee0" strokeWidth="1.2" />
                    <path d="M1 19c0-4 3-7 7-7s7 3 7 7" stroke="#f4eee0" strokeWidth="1.2" />
                    <circle cx="18" cy="7" r="3.2" stroke="#f4eee0" strokeWidth="1.2" />
                    <path d="M13 19c0.3-3.2 2.7-5.5 5.5-5.5 3 0 5.5 2.5 6 5.8" stroke="#f4eee0" strokeWidth="1.2" />
                  </svg>
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
              <div style={{ fontSize: 15, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {room.customTitle ? (
                    room.customTitle
                  ) : room.joinedNames.length === 0 && room.pendingNames.length === 0 ? (
                    '名前未設定'
                  ) : (
                    [...room.joinedNames.map((n) => ({ n, pending: false })), ...room.pendingNames.map((n) => ({ n, pending: true }))]
                      .map((item, i, arr) => (
                        <span key={i} style={{ color: item.pending ? '#b3a98f' : '#211d17' }}>
                          {item.n}{i < arr.length - 1 ? '、' : ''}
                        </span>
                      ))
                  )}
                </span>
                {room.pending && (
                  <span style={{ fontSize: 9, color: '#8a8168', border: '1px solid #8a8168', padding: '1px 6px', fontFamily: "'BIZ UDPGothic', sans-serif", fontWeight: 700, flexShrink: 0 }}>
                    承諾待ち
                  </span>
                )}
                {room.unreadOoc && (
                  <span style={{ fontSize: 9, color: '#4a5580', border: '1px solid #4a5580', padding: '1px 6px', fontFamily: "'BIZ UDPGothic', sans-serif", fontWeight: 700, flexShrink: 0 }}>
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
