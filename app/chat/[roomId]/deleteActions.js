'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

async function fullyDeleteRoom(supabase, roomId) {
  await supabase.from('messages').delete().eq('room_id', roomId)
  await supabase.from('chat_room_npcs').delete().eq('room_id', roomId)
  await supabase.from('room_ooc_messages').delete().eq('room_id', roomId)
  await supabase.from('chat_room_invitations').delete().eq('room_id', roomId)
  await supabase.from('chat_room_members').delete().eq('room_id', roomId)
  await supabase.from('chat_rooms').delete().eq('id', roomId)
}

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

  const uniqueUserIds = new Set((activeMembers || []).map((m) => m.user_id))

  if (uniqueUserIds.size <= 1) {
    // うちの子同士(自分1人だけの部屋) → 相互確認不要、即削除
    await fullyDeleteRoom(supabase, roomId)
  } else if (uniqueUserIds.size === 2) {
    // 1:1(2人の別ユーザー) → 相互確認方式
    await supabase
      .from('chat_room_members')
      .update({ left_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', user.id)

    if (room?.pending_deletion_by && room.pending_deletion_by !== user.id) {
      await fullyDeleteRoom(supabase, roomId)
    } else {
      await supabase.from('chat_rooms').update({ pending_deletion_by: user.id }).eq('id', roomId)
    }
  } else {
    // グループ(3人以上) → 自分だけ退出、最後の1人になったら削除
    await supabase
      .from('chat_room_members')
      .update({ left_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', user.id)

    const { data: remaining } = await supabase
      .from('chat_room_members')
      .select('user_id')
      .eq('room_id', roomId)
      .is('left_at', null)
    const remainingUniqueUsers = new Set((remaining || []).map((m) => m.user_id))
    if (remainingUniqueUsers.size === 0) {
      await fullyDeleteRoom(supabase, roomId)
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

  await fullyDeleteRoom(supabase, roomId)

  revalidatePath('/chat')
  redirect('/chat')
}
