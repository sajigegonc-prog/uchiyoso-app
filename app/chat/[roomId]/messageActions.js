'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'
import { getT } from '@/lib/i18n/server'

export async function editMessage(formData) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const messageId = formData.get('message_id')?.toString()
  const roomId = formData.get('room_id')?.toString()
  const content = formData.get('content')?.toString().trim()
  if (!messageId || !content) return { error: t('内容を入力してください') }

  const { data: original } = await supabase
    .from('messages')
    .select('sender_oc_id, sender_npc_id, ocs(name), chat_room_npcs(name)')
    .eq('id', messageId)
    .maybeSingle()
  const speakerName = original?.ocs?.name || original?.chat_room_npcs?.name || '???'

  const { data, error } = await supabase
    .from('messages')
    .update({ content, edited_at: new Date().toISOString() })
    .eq('id', messageId)
    .select('id')
  if (error) {
    console.error('メッセージ編集エラー:', error)
    return { error: t('編集に失敗しました') }
  }
  if (!data || data.length === 0) {
    return { error: t('編集の権限がありません') }
  }

  await supabase.from('room_ooc_messages').insert({
    room_id: roomId,
    user_id: user.id,
    content: t('{name}のセリフが編集されました', { name: speakerName }),
    is_system: true,
  })

  revalidatePath(`/chat/${roomId}`)
  return { success: true }
}

export async function deleteMessage(formData) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const messageId = formData.get('message_id')?.toString()
  const roomId = formData.get('room_id')?.toString()
  if (!messageId) return { error: t('メッセージが見つかりません') }

  const { data: original } = await supabase
    .from('messages')
    .select('sender_oc_id, sender_npc_id, ocs(name), chat_room_npcs(name)')
    .eq('id', messageId)
    .maybeSingle()
  const speakerName = original?.ocs?.name || original?.chat_room_npcs?.name || '???'

  const { data, error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)
    .select('id')
  if (error) {
    console.error('メッセージ削除エラー:', error)
    return { error: t('削除に失敗しました') }
  }
  if (!data || data.length === 0) {
    return { error: t('削除の権限がありません') }
  }

  await supabase.from('room_ooc_messages').insert({
    room_id: roomId,
    user_id: user.id,
    content: t('{name}のセリフが削除されました', { name: speakerName }),
    is_system: true,
  })

  revalidatePath(`/chat/${roomId}`)
  return { success: true }
}

export async function reorderMessage(formData) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const messageId = formData.get('message_id')?.toString()
  const roomId = formData.get('room_id')?.toString()
  const direction = formData.get('direction')?.toString()
  if (!messageId || !roomId || !direction) return { error: t('情報が不足しています') }

  const { error } = await supabase.rpc('swap_message_order', {
    _room_id: roomId,
    _message_id: messageId,
    _direction: direction,
  })
  if (error) {
    console.error('並び替えエラー:', error)
    return { error: error.message || t('並び替えに失敗しました') }
  }

  revalidatePath(`/chat/${roomId}`)
  return { success: true }
}
