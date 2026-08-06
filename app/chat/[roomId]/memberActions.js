'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function inviteMoreMembers(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  const friendOcIds = formData.getAll('friend_oc_ids').map((v) => v.toString()).filter(Boolean)
  if (!roomId || friendOcIds.length === 0) return { error: '招待するOCを選んでください' }
  const { data: currentCount } = await supabase
    .from('chat_room_members')
    .select('user_id', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .is('left_at', null)
  if ((currentCount?.length || 0) + friendOcIds.length > 10) {
    return { error: 'グループチャットの参加人数は10人までです' }
  }

  const ownerIds = []
  for (const ocId of friendOcIds) {
    const { data: oc } = await supabase.from('ocs').select('user_id').eq('id', ocId).maybeSingle()
    if (oc) ownerIds.push({ ocId, userId: oc.user_id })
  }

  const { data: currentMembers } = await supabase
    .from('chat_room_members')
    .select('user_id')
    .eq('room_id', roomId)
    .is('left_at', null)

  const participantIds = [...new Set([
    user.id,
    ...(currentMembers || []).map((m) => m.user_id),
    ...ownerIds.map((o) => o.userId),
  ])]

  const { data: allFriends, error: checkErr } = await supabase.rpc('check_all_mutual_friends', { user_ids: participantIds })
  if (checkErr || !allFriends) {
    return { error: '招待するメンバー全員が、既存メンバー全員と友達である必要があります。' }
  }

  const { data: currentOcIds } = await supabase
    .from('chat_room_members')
    .select('oc_id')
    .eq('room_id', roomId)
    .is('left_at', null)
  const ocIdsForCheck = [...new Set([...(currentOcIds || []).map((m) => m.oc_id), ...friendOcIds])]
  const { data: dup } = await supabase.rpc('room_with_exact_members_exists', { _oc_ids: ocIdsForCheck, _room_type: 'friend_group', _exclude_room_id: roomId })
  if (dup) {
    return { error: 'その組み合わせだと、既存の別のトークルームとメンバーが完全に一致してしまいます。招待できません。' }
  }

  for (const { ocId, userId } of ownerIds) {
    await supabase.from('chat_room_invitations').insert({
      room_id: roomId,
      inviter_id: user.id,
      invitee_id: userId,
      invitee_oc_id: ocId,
    })
  }
  revalidatePath(`/chat/${roomId}`)
  return { success: true }
}
