'use server'
import { createClient } from '@/lib/supabaseServer'

export async function exportRoomLog(roomId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインしていません' }
  const { data: myOcs } = await supabase.from('ocs').select('id').eq('user_id', user.id)
  const myOcIds = new Set((myOcs || []).map((o) => o.id))
  const { data: messages } = await supabase
    .from('messages')
    .select('content, created_at, sender_oc_id, sender_npc_id, is_system, ocs(name), chat_room_npcs(name)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
  const lines = (messages || []).map((m) => {
    if (m.is_system) return `（${m.content}）`
    const speaker = m.ocs?.name || m.chat_room_npcs?.name || '???'
    const mark = m.sender_oc_id && myOcIds.has(m.sender_oc_id) ? '★' : ''
    return `${mark}${speaker}: ${m.content}`
  })
  return { transcript: lines.join('\n') }
}
