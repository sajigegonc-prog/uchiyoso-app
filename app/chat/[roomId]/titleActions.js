'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'
import { getT } from '@/lib/i18n/server'

export async function updateRoomTitle(roomId, title) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const trimmed = title?.toString().trim().slice(0, 40) || null
  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
  const name = profile?.display_name || t('名前未設定')
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
