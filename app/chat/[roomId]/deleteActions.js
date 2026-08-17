'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function fullyDeleteRoom(supabase, roomId) {
  await supabase.from('messages').delete().eq('room_id', roomId)
  await supabase.from('chat_room_npcs').delete().eq('room_id', roomId)
  await supabase.from('room_ooc_messages').delete().eq('room_id', roomId)
  await supabase.from('chat_room_invitations').delete().eq('room_id', roomId)
  await supabase.from('scene_transition_approvals').delete().eq('room_id', roomId)
  await supabase.from('chat_room_members').delete().eq('room_id', roomId)
  await supabase.from('chat_rooms').delete().eq('id', roomId)
}

export async function confirmLeaveOrDelete(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  if (!roomId) redirect('/chat')
  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
  await supabase.from('room_ooc_messages').insert({
    room_id: roomId, user_id: user.id, is_system: true, log_type: 'member_leave',
    content: `${profile?.display_name || '名前未設定'}さんが退室しました`,
  })
  await supabase
    .from('chat_room_members')
    .update({ left_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id)

  const { data: remainingMembers } = await supabase
    .from('chat_room_members')
    .select('user_id')
    .eq('room_id', roomId)
    .is('left_at', null)
  const remainingUnique = new Set((remainingMembers || []).map((m) => m.user_id))

  if (remainingUnique.size === 0) {
    await fullyDeleteRoom(supabase, roomId)
  } else if (remainingUnique.size === 1) {
    await supabase.from('chat_rooms').update({ pending_deletion_by: user.id }).eq('id', roomId)
  }

  revalidatePath('/chat')
  redirect('/chat')
}

export async function acknowledgeFinalDeletion(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  if (!roomId) redirect('/chat')
  await fullyDeleteRoom(supabase, roomId)
  revalidatePath('/chat')
  redirect('/chat')
}
