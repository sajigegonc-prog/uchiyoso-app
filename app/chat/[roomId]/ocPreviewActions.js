'use server'
import { createClient } from '@/lib/supabaseServer'

export async function getOcDetailForRoom(ocId, roomId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '権限がありません' }
  const { data: membership } = await supabase.from('chat_room_members').select('id').eq('room_id', roomId).eq('user_id', user.id).maybeSingle()
  if (!membership) return { error: '権限がありません' }
  const { data: oc } = await supabase.from('ocs').select('name, icon_url, house, oc_type, birth_date, description, paired_character').eq('id', ocId).maybeSingle()
  if (!oc) return { error: '見つかりません' }
  return { oc }
}
