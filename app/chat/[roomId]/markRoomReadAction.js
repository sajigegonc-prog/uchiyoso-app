'use server'
import { createClient } from '@/lib/supabaseServer'

export async function markRoomRead(roomId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !roomId) return
  await supabase
    .from('chat_room_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id)
}
