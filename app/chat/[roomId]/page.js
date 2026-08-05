import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { sendMessage } from './actions'
import { addNpc, deleteNpc } from './npcActions'
import { sendOocMessage, openFrogCard } from './oocActions'
import { requestDeleteRoom, acknowledgeDeletion } from './deleteActions'
import MessageForm from './MessageForm'
import DeletionNotice from './DeletionNotice'
import DeleteRoomButton from './DeleteRoomButton'
import AutoRefresh from '@/components/AutoRefresh'
export default async function ChatRoomPage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { roomId } = params
  const { data: room } = await supabase
    .from('chat_rooms')
    .select('id, location, time_period, primary_oc_id, pending_deletion_by, deleted_at')
    .eq('id', roomId)
    .maybeSingle()
  if (!room) {
    return (
      <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px' }}>
        <Link href="/chat" style={{ fontSize: 12, color: '#6b6250', textDecoration: 'none' }}>← 一覧に戻る</Link>
        <p style={{ fontSize: 13, color: '#8a8168', marginTop: 20, fontStyle: 'italic' }}>この部屋は見つからないか、参加していません。</p>
      </div>
    )
  }
  await supabase
    .from('chat_room_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id)
  const { data: members } = await supabase
    .from('chat_room_members')
    .select('user_id, oc_id, ocs(name), left_at, ooc_last_read_at')
    .eq('room_id', roomId)
  const { data: npcs } = await supabase
    .from('chat_room_npcs')
    .select('id, name, created_by')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, created_at, sender_oc_id, sender_npc_id, is_system, ocs(name, icon_url), chat_room_npcs(name)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
  const { data: oocMessagesRaw } = await supabase
    .from('room_ooc_messages')
    .select('id, content, is_system, created_at, user_id')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
  const oocUserIds = [...new Set((oocMessagesRaw || []).map((m) => m.user_id))]
  const { data: oocProfiles } = oocUserIds.length > 0
    ? await supabase.from('profiles').select('id, display_name').in('id', oocUserIds)
    : { data: [] }
  const oocNameMap = new Map((oocProfiles || []).map((p) => [p.id, p.display_name]))
  const oocMessages = (oocMessagesRaw || []).map((m) => ({
    ...m,
    senderName: oocNameMap.get(m.user_id) || '名前未設定',
  }))
  const myOcs = (members || [])
    .filter((m) => m.user_id === user.id)
    .map((m) => ({ id: m.oc_id, name: m.ocs?.name }))
  const myNpcs = (npcs || []).filter((n) => n.created_by === user.id).map((n) => n.id)
  const memberNames = (members || []).map((m) => m.ocs?.name).filter(Boolean)
  const activeMembers = (members || []).filter((m) => !m.left_at)
  const uniqueUserCount = new Set(activeMembers.map((m) => m.user_id)).size
  const isSelfRoom = uniqueUserCount <= 1
  const isGroup = uniqueUserCount > 2
  const myMembership = (members || []).find((m) => m.user_id === user.id)
  const { data: latestOocMsg } = await supabase
    .from('room_ooc_messages')
    .select('created_at, user_id')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const hasUnreadOoc = !!(
    latestOocMsg &&
    latestOocMsg.user_id !== user.id &&
    (!myMembership?.ooc_last_read_at || new Date(latestOocMsg.created_at) > new Date(myMembership.ooc_last_read_at))
  )
  const showDeletionNotice = !isSelfRoom && room.pending_deletion_by && room.pending_deletion_by !== user.id && !myMembership?.left_at
  const deleteButtonLabel = isGroup ? '退出' : '削除'
  return (
    <div className="chat-room-height" style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#efe8d8',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <AutoRefresh intervalMs={4000} />
      {showDeletionNotice && (
        <DeletionNotice roomId={room.id} action={acknowledgeDeletion} />
      )}
      <div style={{ background: '#f4eee0', padding: '14px 18px', flexShrink: 0, borderBottom: '4px double #211d17' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Link href="/chat" style={{ fontSize: 11.5, color: '#6b6250', textDecoration: 'none' }}>← 一覧に戻る</Link>
          <DeleteRoomButton roomId={room.id} label={deleteButtonLabel} action={requestDeleteRoom} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, marginTop: 8, color: '#211d17', fontFamily: 'Georgia, serif' }}>
          {memberNames.join('、')}
        </div>
        {(room.location || room.time_period) && (
          <div style={{ fontSize: 11, opacity: .85, marginTop: 5, display: 'flex', gap: 12, color: '#6b6250', fontStyle: 'italic' }}>
            {room.location && <span>場所: {room.location}</span>}
            {room.time_period && <span>時間帯: {room.time_period}</span>}
          </div>
        )}
        <p style={{ fontSize: 9.5, opacity: .7, marginTop: 5, color: '#8a8168' }}>
          変更は「/場所 ○○」「/時間帯 ○○」と発言すると反映されます
        </p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 74px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(!messages || messages.length === 0) && (
          <p style={{ fontSize: 12.5, color: '#8a8168', textAlign: 'center', marginTop: 20, fontStyle: 'italic' }}>まだメッセージがありません。</p>
        )}
        {messages && messages.map((msg) => {
          if (msg.is_system) {
            return (
              <div key={msg.id} style={{ textAlign: 'center', fontSize: 11, color: '#8a8168', fontStyle: 'italic' }}>
                — {msg.content} —
              </div>
            )
          }
          const mine = msg.sender_oc_id === room.primary_oc_id
          const speakerName = msg.ocs?.name || msg.chat_room_npcs?.name
          const speakerIcon = msg.ocs?.icon_url || null
          return (
            <div key={msg.id} style={{
              display: 'flex', gap: 8, alignItems: 'flex-end',
              flexDirection: mine ? 'row-reverse' : 'row',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                background: '#211d17', border: '1px solid #211d17',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#f4eee0', fontWeight: 700, fontSize: 12, fontFamily: 'Georgia, serif',
              }}>
                {speakerIcon ? (
                  <img src={speakerIcon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (speakerName || '?').charAt(0)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
                {!mine && (
                  <div style={{ fontSize: 10.5, color: '#6b6250', marginBottom: 3, fontStyle: 'italic' }}>{speakerName}</div>
                )}
                <div style={{
                  padding: '9px 13px', fontSize: 14, lineHeight: 1.6,
                  background: mine ? '#211d17' : '#fff', color: mine ? '#f4eee0' : '#211d17',
                  border: '1px solid #211d17',
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {myOcs.length > 0 ? (
        <MessageForm
          action={sendMessage}
          roomId={room.id}
          myOcs={myOcs}
          npcs={npcs || []}
          myUserId={user.id}
          addNpcAction={addNpc}
          deleteNpcAction={deleteNpc}
          frogAction={openFrogCard}
          oocMessages={oocMessages || []}
          oocSendAction={sendOocMessage}
          hasUnreadOoc={hasUnreadOoc}
        />
      ) : (
        <p style={{ fontSize: 12, color: '#8a8168', textAlign: 'center', padding: 16, flexShrink: 0, fontStyle: 'italic' }}>あなたはこの部屋のメンバーではありません。</p>
      )}
    </div>
  )
}
