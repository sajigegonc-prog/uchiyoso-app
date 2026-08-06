'use server'
import { createClient } from '@/lib/supabaseServer'

export async function getOcDetailForRoom(ocId, roomId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインしていません' }
  const { data: memberships, error: memErr } = await supabase
    .from('chat_room_members')
    .select('id')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .limit(1)
  if (memErr) return { error: `会員確認エラー: ${memErr.message}` }
  if (!memberships || memberships.length === 0) return { error: `メンバー情報が見つかりません(room:${roomId} / user:${user.id})` }
  const { data: oc, error: ocErr } = await supabase
    .from('ocs')
    .select('name, icon_url, house, oc_type, birth_date, description, paired_character')
    .eq('id', ocId)
    .maybeSingle()
  if (ocErr) return { error: `OC取得エラー: ${ocErr.message}` }
  if (!oc) return { error: `OCが見つかりません(oc:${ocId})` }
  return { oc }
}
