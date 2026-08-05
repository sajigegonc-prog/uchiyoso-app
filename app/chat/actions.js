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
  const selfPlay = formData.get('self_play')?.toString() === 'on'
  const friendOcIds = formData.getAll('friend_oc_ids').map((v) => v.toString()).filter(Boolean)
  const extraOcIds = formData.getAll('extra_oc_ids').map((v) => v.toString()).filter(Boolean)
  if (!ocId) redirect('/chat/new')

  const { data: room, error } = await supabase
    .from('chat_rooms')
    .insert({
      created_by: user.id,
      location: location || null,
      time_period: timePeriod || null,
      primary_oc_id: ocId,
    })
    .select('id')
    .single()
  if (error || !room) {
    console.error('部屋作成エラー:', error)
    redirect('/chat/new')
  }
  await supabase.from('chat_room_members').insert({
    room_id: room.id,
    oc_id: ocId,
    user_id: user.id,
  })
  if (selfPlay) {
    for (const extraOcId of extraOcIds) {
      if (extraOcId !== ocId) {
        await supabase.from('chat_room_members').insert({
          room_id: room.id,
          oc_id: extraOcId,
          user_id: user.id,
        })
      }
    }
  }
  for (const friendOcId of friendOcIds) {
    const { data: friendOc } = await supabase.from('ocs').select('user_id').eq('id', friendOcId).maybeSingle()
    if (friendOc) {
      await supabase.from('chat_room_invitations').insert({
        room_id: room.id,
        inviter_id: user.id,
        invitee_id: friendOc.user_id,
        invitee_oc_id: friendOcId,
      })
    }
  }
  redirect(`/chat/${room.id}`)
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
    await supabase.from('chat_room_members').insert({
      room_id: roomId,
      oc_id: ocId,
      user_id: user.id,
    })
    await supabase
      .from('chat_room_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationId)
      .eq('invitee_id', user.id)
    redirect(`/chat/${roomId}`)
  } else if (decision === 'declined') {
    await supabase
      .from('chat_room_invitations')
      .update({ status: 'declined' })
      .eq('id', invitationId)
      .eq('invitee_id', user.id)
    revalidatePath('/chat')
  }
}
