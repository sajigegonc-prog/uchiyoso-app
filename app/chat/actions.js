'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'
import { fullyDeleteRoom } from './[roomId]/deleteActions'
import { getT } from '@/lib/i18n/server'
import { getActorLabel } from '@/lib/strangerRoom'

export async function createRoom(formData) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const ocId = formData.get('oc_id')?.toString()
  const location = formData.get('location')?.toString().trim()
  const timePeriod = formData.get('time_period')?.toString().trim()
  const roomType = formData.get('room_type')?.toString()
  const note = formData.get('note')?.toString().trim()
  const title = formData.get('title')?.toString().trim()
  const friendOcIds = formData.getAll('friend_oc_ids').map((v) => v.toString()).filter(Boolean)
  const extraOcIds = formData.getAll('extra_oc_ids').map((v) => v.toString()).filter(Boolean)
  const strangerMode = formData.get('stranger_match') === '1'
  if (!ocId) return { error: t('話すOCを選択してください') }

  let strangerOwnerId = null
  if (strangerMode) {
    if (roomType !== 'friend_1on1' || friendOcIds.length !== 1) return { error: t('お相手を1人選んでください') }
    const { data: owner } = await supabase.rpc('stranger_match_owner', { _oc_id: friendOcIds[0] })
    if (!owner) return { error: t('このお相手とはマッチングできなくなりました。もう一度お試しください。') }
    strangerOwnerId = owner
  }

  if (roomType === 'friend_group') {
    if (friendOcIds.length < 2) return { error: t('グループチャットは3人以上(自分+友達2人以上)が必要です') }
    if (friendOcIds.length + 1 > 10) return { error: t('グループチャットの参加人数は10人までです') }
    if (friendOcIds.length < 2) return { error: t('グループチャットは3人以上(自分+友達2人以上)が必要です') }
    const ownerIds = []
    for (const fid of friendOcIds) {
      const { data: oc } = await supabase.from('ocs').select('user_id').eq('id', fid).maybeSingle()
      if (oc) ownerIds.push(oc.user_id)
    }
    const participantIds = [...new Set([user.id, ...ownerIds])]
    const { data: allFriends, error: checkErr } = await supabase.rpc('check_all_mutual_friends', { user_ids: participantIds })
    if (checkErr || !allFriends) {
      return { error: t('参加者全員が友達同士である必要があります。') }
    }
    const ocIdsForCheck = [ocId, ...friendOcIds]
    const { data: dup } = await supabase.rpc('room_with_exact_members_exists', { _oc_ids: ocIdsForCheck, _room_type: 'friend_group' })
    if (dup) {
      return { error: t('同じメンバー構成のトークルームがすでに存在します。') }
    }
  }
  if (roomType === 'friend_1on1') {
  if (friendOcIds.length !== 1) return { error: t('お相手を1人選んでください') }
  const ocIdsForCheck = [ocId, friendOcIds[0]]
  const { data: dup } = await supabase.rpc('room_with_exact_members_exists', {
    _oc_ids: ocIdsForCheck, _room_type: 'friend_1on1' })
    if (dup) {
      return { error: t('同じメンバー構成のトークルームがすでに存在します。') }
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
      stranger_match: strangerMode,
    })
    .select('id')
    .single()
  if (error || !room) {
    console.error('部屋作成エラー:', error)
    return { error: t('部屋の作成に失敗しました') }
  }
  await supabase.from('chat_room_members').insert({ room_id: room.id, oc_id: ocId, user_id: user.id })

  await supabase.from('room_ooc_messages').insert({
    room_id: room.id,
    user_id: user.id,
    is_system: true,
    content: t('「/状況 ○○」と打つことで「(NPC)が去る」などの状況をログに残せます'),
  })

  if (strangerMode) {
    await supabase.from('room_ooc_messages').insert({
      room_id: room.id,
      user_id: user.id,
      is_system: true,
      content: t('このお部屋は、お互いが友達になるまで、中の人チャットでの発言ができません（蛙チョコなどのログは表示されます）。中の人チャットの「友達申請」から、申請できます。'),
    })
  }

  if (strangerMode) {
    await supabase.from('chat_room_invitations').insert({
      room_id: room.id, inviter_id: user.id, invitee_id: strangerOwnerId, invitee_oc_id: friendOcIds[0], note: note || null,
    })
  } else if (roomType === 'self') {
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
          room_id: room.id, inviter_id: user.id, invitee_id: friendOc.user_id, invitee_oc_id: friendOcId, note: note || null,
        })
      }
    }
  }
  return { id: room.id }
}

export async function respondToChatInvitation(formData) {
  const t = getT()
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
    const actorLabel = await getActorLabel(supabase, user.id, roomId, t)
    await supabase.from('room_ooc_messages').insert({
      room_id: roomId, user_id: user.id, is_system: true, log_type: 'member_join',
      content: t('{name}さんが入室しました', { name: actorLabel }),
    })
    redirect(`/chat/${roomId}?welcome=1`)
  } else if (decision === 'declined') {
    await supabase.from('chat_room_invitations').update({ status: 'declined' }).eq('id', invitationId).eq('invitee_id', user.id)

    const { data: declinedOc } = await supabase.from('ocs').select('name').eq('id', ocId).maybeSingle()
    const reasonText = t('{name}は急いでいたようで立ち去ってしまいました', { name: declinedOc?.name || t('相手') })
    const { data: roomInfo } = await supabase.from('chat_rooms').select('room_type').eq('id', roomId).maybeSingle()

    if (roomInfo?.room_type === 'friend_1on1') {
      await supabase.from('chat_rooms').update({
        pending_deletion_by: user.id,
        pending_deletion_reason: reasonText,
      }).eq('id', roomId)
    } else if (roomInfo?.room_type === 'friend_group') {
      await supabase.from('room_ooc_messages').insert({
        room_id: roomId, user_id: user.id, is_system: true,
        content: reasonText,
      })
      const { data: stillPending } = await supabase
        .from('chat_room_invitations')
        .select('id')
        .eq('room_id', roomId)
        .eq('status', 'pending')
      const { data: activeMembers } = await supabase
        .from('chat_room_members')
        .select('user_id')
        .eq('room_id', roomId)
        .is('left_at', null)
      const activeCount = new Set((activeMembers || []).map((m) => m.user_id)).size
      if ((stillPending || []).length === 0 && activeCount <= 1) {
        await supabase.from('chat_rooms').update({
          pending_deletion_by: user.id,
          pending_deletion_reason: reasonText,
        }).eq('id', roomId)
      }
    }

    revalidatePath('/chat')
  }
}


export async function cancelInvitation(formData) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const invitationId = formData.get('invitation_id')?.toString()
  const roomId = formData.get('room_id')?.toString()
  if (!invitationId || !roomId) return { error: t('情報が不足しています') }

  const { data: invitation } = await supabase
    .from('chat_room_invitations')
    .select('id')
    .eq('id', invitationId)
    .eq('inviter_id', user.id)
    .maybeSingle()
  if (!invitation) return { error: t('取り消す権限がありません') }

  await supabase.from('chat_room_invitations').delete().eq('id', invitationId).eq('inviter_id', user.id)

  const { data: roomInfo } = await supabase.from('chat_rooms').select('room_type').eq('id', roomId).maybeSingle()

  let deleted = false
  if (roomInfo?.room_type === 'friend_1on1') {
    await fullyDeleteRoom(supabase, roomId)
    deleted = true
  } else if (roomInfo?.room_type === 'friend_group') {
    const { data: stillPending } = await supabase
      .from('chat_room_invitations')
      .select('id')
      .eq('room_id', roomId)
      .eq('status', 'pending')
    const { data: activeMembers } = await supabase
      .from('chat_room_members')
      .select('user_id')
      .eq('room_id', roomId)
      .is('left_at', null)
    const activeCount = new Set((activeMembers || []).map((m) => m.user_id)).size
    if ((stillPending || []).length === 0 && activeCount <= 1) {
      await fullyDeleteRoom(supabase, roomId)
      deleted = true
    }
  }

  revalidatePath('/chat')
  return { success: true, deleted }
}


export async function declineAndBlock(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const invitationId = formData.get('invitation_id')?.toString()
  const label = formData.get('inviter_oc_name')?.toString() || null
  if (invitationId) {
    const { data: invitation } = await supabase
      .from('chat_room_invitations')
      .select('inviter_id')
      .eq('id', invitationId)
      .eq('invitee_id', user.id)
      .maybeSingle()
    if (invitation?.inviter_id) {
      await supabase.from('user_blocks').upsert(
        { blocker_id: user.id, blocked_id: invitation.inviter_id, blocked_label: label },
        { onConflict: 'blocker_id,blocked_id' }
      )
    }
  }
  formData.set('decision', 'declined')
  return respondToChatInvitation(formData)
}
