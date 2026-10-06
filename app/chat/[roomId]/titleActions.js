'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'
import { getT } from '@/lib/i18n/server'
import { getActorLabel } from '@/lib/strangerRoom'

export async function updateRoomTitle(roomId, title) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const trimmed = title?.toString().trim().slice(0, 40) || null
  const name = await getActorLabel(supabase, user.id, roomId, t)
  await supabase.from('chat_rooms').update({ title: trimmed }).eq('id', roomId)
  await supabase.from('room_ooc_messages').insert({
    room_id: roomId,
    user_id: user.id,
    is_system: true,
    content: trimmed ? t('{name}さんがチャット名を「{title}」に変更しました', { name, title: trimmed }) : t('{name}さんがチャット名をリセットしました', { name }),
  })
  revalidatePath(`/chat/${roomId}`)
  revalidatePath('/chat')
}
