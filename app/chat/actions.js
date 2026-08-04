'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'
export async function createRoom(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const ocId = formData.get('oc_id')?.toString()
  const name = formData.get('name')?.toString().trim()
  const location = formData.get('location')?.toString().trim()
  const selfPlay = formData.get('self_play')?.toString() === 'on'
  const friendId = formData.get('friend_id')?.toString()
  const extraOcIds = formData.getAll('extra_oc_ids').map((v) => v.toString()).filter(Boolean)
  if (!ocId) redirect('/chat/new')
  const { data: room, error } = await supabase
    .from('chat_rooms')
    .insert({
      name: name || null,
      location: location || null,
      created_by: user.id,
    })
    .select('id')
    .single()
  if (error || !room) redirect('/chat/new')
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
  } else if (friendId) {
    await supabase.from('chat_room_invitations').insert({
      room_id: room.id,
      inviter_id: user.id,
      invitee_id: friendId,
    })
  }
  redirect(`/chat/${room.id}`)
}
export async function respondToChatInvitation(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
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
