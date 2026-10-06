'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'
import { getT } from '@/lib/i18n/server'
import { confirmLeaveOrDelete } from './deleteActions'

// この部屋で「まだ友達になっていない相手」のユーザーIDを返す（いなければ null）
async function findNonFriendPartner(supabase, userId, roomId) {
  const { data: room } = await supabase.from('chat_rooms').select('stranger_match').eq('id', roomId).maybeSingle()
  if (!room?.stranger_match) return null
  const { data: members } = await supabase
    .from('chat_room_members')
    .select('user_id, ocs(name)')
    .eq('room_id', roomId)
    .is('left_at', null)
    .neq('user_id', userId)
  for (const m of members || []) {
    const { data: isFriend } = await supabase.rpc('is_friend', { _a: userId, _b: m.user_id })
    if (!isFriend) return { userId: m.user_id, ocName: m.ocs?.name || null }
  }
  return null
}

async function postSystem(supabase, roomId, userId, content) {
  await supabase.from('room_ooc_messages').insert({ room_id: roomId, user_id: userId, is_system: true, content })
}

// 部屋の中から友達申請を送る
export async function sendRoomFriendRequest(roomId) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const partner = await findNonFriendPartner(supabase, user.id, roomId)
  if (!partner) return { error: t('友達申請できる相手がいません') }

  const { data: existing } = await supabase
    .from('friendships')
    .select('id, status, requester_id')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${partner.userId}),and(requester_id.eq.${partner.userId},addressee_id.eq.${user.id})`)
    .limit(1)
    .maybeSingle()
  if (existing && existing.status === 'pending') return { ok: true }

  if (existing) {
    await supabase.from('friendships').delete().eq('id', existing.id)
  }
  const { error } = await supabase.from('friendships').insert({
    requester_id: user.id,
    addressee_id: partner.userId,
    via_room_id: roomId,
  })
  if (error) return { error: t('友達申請に失敗しました') }
  await postSystem(supabase, roomId, user.id, t('友達申請が送られました。承認されると、中の人チャットで発言できるようになります。'))
  revalidatePath(`/chat/${roomId}`)
  return { ok: true }
}

// 送った友達申請を取り消す
export async function cancelRoomFriendRequest(roomId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  await supabase
    .from('friendships')
    .delete()
    .eq('via_room_id', roomId)
    .eq('requester_id', user.id)
    .eq('status', 'pending')
  revalidatePath(`/chat/${roomId}`)
  return { ok: true }
}

// 届いた友達申請に答える
export async function respondRoomFriendRequest(roomId, decision) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  if (decision !== 'accepted' && decision !== 'declined') return { error: t('情報が不足しています') }
  const { data: req } = await supabase
    .from('friendships')
    .select('id')
    .eq('via_room_id', roomId)
    .eq('addressee_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()
  if (!req) return { error: t('友達申請が見つかりません') }
  await supabase
    .from('friendships')
    .update({ status: decision, responded_at: new Date().toISOString() })
    .eq('id', req.id)
    .eq('addressee_id', user.id)
  if (decision === 'accepted') {
    await postSystem(supabase, roomId, user.id, t('友達になりました。中の人チャットで発言できます。'))
  } else {
    await postSystem(supabase, roomId, user.id, t('友達申請は見送られました。'))
  }
  revalidatePath(`/chat/${roomId}`)
  revalidatePath('/friends')
  return { ok: true }
}

// 相手をブロックして部屋を抜ける
export async function blockPartnerAndLeave(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  if (!roomId) redirect('/chat')
  const partner = await findNonFriendPartner(supabase, user.id, roomId)
  if (partner) {
    await supabase.from('user_blocks').upsert(
      { blocker_id: user.id, blocked_id: partner.userId, blocked_label: partner.ocName },
      { onConflict: 'blocker_id,blocked_id' }
    )
    await supabase
      .from('friendships')
      .delete()
      .eq('via_room_id', roomId)
      .eq('status', 'pending')
  }
  return confirmLeaveOrDelete(formData)
}
