'use server'
import { createClient } from '@/lib/supabaseServer'

export async function exportRoomLog(roomId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインしていません' }
  const { data: room } = await supabase.from('chat_rooms').select('room_type, primary_oc_id').eq('id', roomId).maybeSingle()
  const { data: myOcs } = await supabase.from('ocs').select('id').eq('user_id', user.id)
  const myOcIds = new Set((myOcs || []).map((o) => o.id))
  const { data: messages } = await supabase
    .from('messages')
    .select('content, created_at, sender_oc_id, sender_npc_id, is_system, deleted_at, ocs(name), chat_room_npcs(name)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
  const lines = (messages || [])
    .filter((m) => !m.deleted_at)
    .map((m) => {
      if (m.is_system) return `（${m.content}）`
      const speaker = m.ocs?.name || m.chat_room_npcs?.name || '???'
      const isMine = room?.room_type === 'self'
        ? m.sender_oc_id === room.primary_oc_id
        : (m.sender_oc_id && myOcIds.has(m.sender_oc_id))
      const mark = isMine ? '★' : ''
      return `${mark}${speaker}: ${m.content}`
    })
  return { transcript: lines.join('\n') }
}
