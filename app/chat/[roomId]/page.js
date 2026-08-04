import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { sendMessage } from './actions'
import { addNpc, deleteNpc } from './npcActions'
import { lightBackLinkStyle } from '../../ocs/styles'
import MessageForm from './MessageForm'
export default async function ChatRoomPage({ params }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const { roomId } = params
  const { data: room } = await supabase
    .from('chat_rooms')
    .select('id, name, location, situation')
    .eq('id', roomId)
    .maybeSingle()
  if (!room) {
    return (
      <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh', padding: '28px 20px' }}>
        <Link href="/chat" style={lightBackLinkStyle}>← チャット一覧に戻る</Link>
        <p style={{ fontSize: 13, color: '#8b7355', marginTop: 20 }}>この部屋は見つからないか、参加していません。</p>
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
    .select('user_id, oc_id, ocs(name)')
    .eq('room_id', roomId)
  const { data: npcs } = await supabase
    .from('chat_room_npcs')
    .select('id, name, created_by')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, created_at, sender_oc_id, sender_npc_id, ocs(name), chat_room_npcs(name)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
  const myOcs = (members || [])
    .filter((m) => m.user_id === user.id)
    .map((m) => ({ id: m.oc_id, name: m.ocs?.name }))
  const myNpcs = (npcs || []).filter((n) => n.created_by === user.id).map((n) => n.id)
  const memberNames = (members || []).map((m) => m.ocs?.name).filter(Boolean)
  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#eee1cb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#241a10', color: '#f3e9d8', padding: '14px 20px' }}>
        <Link href="/chat" style={{ fontSize: 12, color: '#c9a876', textDecoration: 'none' }}>← 一覧に戻る</Link>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6 }}>{room.name || '名前未設定の部屋'}</div>
        <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 2 }}>{memberNames.join(' × ')}</div>
        {room.location && <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 4 }}>📍 {room.location}</div>}
      </div>
      <div style={{ flex: 1, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(!messages || messages.length === 0) && (
          <p style={{ fontSize: 12.5, color: '#8b7355', textAlign: 'center', marginTop: 20 }}>まだメッセージがありません。</p>
        )}
        {messages && messages.map((msg) => {
          const mine = myOcs.some((oc) => oc.id === msg.sender_oc_id) || myNpcs.includes(msg.sender_npc_id)
          const speakerName = msg.ocs?.name || msg.chat_room_npcs?.name
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <div style={{ fontSize: 10.5, color: '#8b7355', marginBottom: 2 }}>{speakerName}</div>
              <div style={{
                maxWidth: '75%', padding: '9px 13px', borderRadius: 3, fontSize: 14, lineHeight: 1.5,
                background: mine ? '#8b5a2b' : '#fff', color: mine ? '#f3e9d8' : '#241a10',
                border: mine ? '2px solid #3d2717' : '2px solid #d8c7ac',
              }}>
                {msg.content}
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
        />
      ) : (
        <p style={{ fontSize: 12, color: '#8b7355', textAlign: 'center', padding: 16 }}>あなたはこの部屋のメンバーではありません。</p>
      )}
    </div>
  )
}
