'use server'
import { createClient } from '@/lib/supabaseServer'
import { getT } from '@/lib/i18n/server'

export async function getOcDetailForRoom(ocId, roomId) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: t('ログインしていません') }
  const { data: memberships, error: memErr } = await supabase
    .from('chat_room_members')
    .select('room_id')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .limit(1)
  if (memErr) return { error: t('会員確認エラー: {message}', { message: memErr.message }) }
  if (!memberships || memberships.length === 0) return { error: t('メンバー情報が見つかりません(room:{roomId} / user:{userId})', { roomId, userId: user.id }) }
  const { data: oc, error: ocErr } = await supabase
    .from('ocs')
    .select('name, icon_url, house, oc_type, birth_date, description, paired_character, career') 
    .eq('id', ocId)
    .maybeSingle()
  if (ocErr) return { error: t('OC取得エラー: {message}', { message: ocErr.message }) }
  if (!oc) return { error: t('OCが見つかりません(oc:{ocId})', { ocId }) }
  return { oc }
}
