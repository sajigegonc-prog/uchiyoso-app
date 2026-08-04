'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function requestDeleteRoom(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  if (!roomId) redirect('/chat')

  const { data: room } = await supabase
    .from('chat_rooms')
    .select('pending_deletion_by')
    .eq('id', roomId)
    .maybeSingle()

  const { data: activeMembers } = await supabase
    .from('chat_room_members')
    .select('user_id')
    .eq('room_id', roomId)
    .is('left_at', null)

  const isGroup = (activeMembers?.length || 0) > 2

  await supabase
    .from('chat_room_members')
    .update({ left_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id)

  if (isGroup) {
    const { data: remaining } = await supabase
      .from('chat_room_members')
      .select('user_id')
      .eq('room_id', roomId)
      .is('left_at', null)
    if (!remaining || remaining.length === 0) {
      await supabase.from('chat_rooms').update({ deleted_at: new Date().toISOString() }).eq('id', roomId)
    }
  } else {
    if (room?.pending_deletion_by && room.pending_deletion_by !== user.id) {
      await supabase.from('chat_rooms').update({ deleted_at: new Date().toISOString() }).eq('id', roomId)
    } else {
      await supabase.from('chat_rooms').update({ pending_deletion_by: user.id }).eq('id', roomId)
    }
  }

  revalidatePath('/chat')
  redirect('/chat')
}

export async function acknowledgeDeletion(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  if (!roomId) redirect('/chat')

  await supabase
    .from('chat_room_members')
    .update({ left_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id)

  await supabase.from('chat_rooms').update({ deleted_at: new Date().toISOString() }).eq('id', roomId)

  revalidatePath('/chat')
  redirect('/chat')
}
