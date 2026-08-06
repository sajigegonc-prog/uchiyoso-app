'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function createRoom(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const ocId = formData.get('oc_id')?.toString()
  const location = formData.get('location')?.toString().trim()
  const timePeriod = formData.get('time_period')?.toString().trim()
  const roomType = formData.get('room_type')?.toString()
  const title = formData.get('title')?.toString().trim()
  const friendOcIds = formData.getAll('friend_oc_ids').map((v) => v.toString()).filter(Boolean)
  const extraOcIds = formData.getAll('extra_oc_ids').map((v) => v.toString()).filter(Boolean)
  if (!ocId) return { error: '話すOCを選択してください' }

  if (roomType === 'friend_group') {
    if (friendOcIds.length < 2) return { error: 'グループチャットは3人以上(自分+友達2人以上)が必要です' }
    if (friendOcIds.length + 1 > 10) return { error: 'グループチャットの参加人数は10人までです' }
    if (friendOcIds.length < 2) return { error: 'グループチャットは3人以上(自分+友達2人以上)が必要です' }
    const ownerIds = []
    for (const fid of friendOcIds) {
      const { data: oc } = await supabase.from('ocs').select('user_id').eq('id', fid).maybeSingle()
      if (oc) ownerIds.push(oc.user_id)
    }
    const participantIds = [...new Set([user.id, ...ownerIds])]
    const { data: allFriends, error: checkErr } = await supabase.rpc('check_all_mutual_friends', { user_ids: participantIds })
    if (checkErr || !allFriends) {
      return { error: '参加者全員が友達同士である必要があります。' }
    }
    const ocIdsForCheck = [ocId, ...friendOcIds]
    const { data: dup } = await supabase.rpc('room_with_exact_members_exists', { _oc_ids: ocIdsForCheck, _room_type: 'friend_group' })
    if (dup) {
      return { error: '同じメンバー構成のトークルームがすでに存在します。' }
    }
  }
  if (roomType === 'friend_1on1') {
    if (friendOcIds.length !== 1) return { error: 'お相手を1人選んでください' }
    const { data: dup } = await supabase.rpc('room_with_exact_members_exists', { _oc_ids: ocIdsForCheck, _room_type: 'friend_1on1' })
    const { data: dup } = await supabase.rpc('room_with_exact_members_exists', { _oc_ids: ocIdsForCheck })
    if (dup) {
      return { error: '同じメンバー構成のトークルームがすでに存在します。' }
    }
  }

  const { data: room, error } = await supabase
    .from('chat_rooms')
    .insert({
      created_by: user.id,
      location: location || null,
      time_period: timePeriod || null,
      primary_oc_id: ocId,
      title: roomType === 'friend_group' && title ? title : null,
      room_type: roomType,
    })
    .select('id')
    .single()
  if (error || !room) {
    console.error('部屋作成エラー:', error)
    return { error: '部屋の作成に失敗しました' }
  }
  await supabase.from('chat_room_members').insert({ room_id: room.id, oc_id: ocId, user_id: user.id })

  if (roomType === 'self') {
    for (const extraOcId of extraOcIds) {
      if (extraOcId !== ocId) {
        await supabase.from('chat_room_members').insert({ room_id: room.id, oc_id: extraOcId, user_id: user.id })
      }
    }
  } else {
    for (const friendOcId of friendOcIds) {
      const { data: friendOc } = await supabase.from('ocs').select('user_id').eq('id', friendOcId).maybeSingle()
      if (friendOc) {
        await supabase.from('chat_room_invitations').insert({
          room_id: room.id, inviter_id: user.id, invitee_id: friendOc.user_id, invitee_oc_id: friendOcId,
        })
      }
    }
  }
  return { id: room.id }
}

export async function respondToChatInvitation(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const invitationId = formData.get('invitation_id')?.toString()
  const decision = formData.get('decision')?.toString()
  const ocId = formData.get('oc_id')?.toString()
  const roomId = formData.get('room_id')?.toString()
  if (decision === 'accepted' && ocId && roomId) {
    await supabase.from('chat_room_members').insert({ room_id: roomId, oc_id: ocId, user_id: user.id })
    await supabase.from('chat_room_invitations').update({ status: 'accepted' }).eq('id', invitationId).eq('invitee_id', user.id)
    redirect(`/chat/${roomId}`)
  } else if (decision === 'declined') {
    await supabase.from('chat_room_invitations').update({ status: 'declined' }).eq('id', invitationId).eq('invitee_id', user.id)
    revalidatePath('/chat')
  }
}
