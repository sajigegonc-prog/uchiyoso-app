'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function editMessage(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const messageId = formData.get('message_id')?.toString()
  const roomId = formData.get('room_id')?.toString()
  const content = formData.get('content')?.toString().trim()
  if (!messageId || !content) return { error: '内容を入力してください' }
  const { data, error } = await supabase
    .from('messages')
    .update({ content, edited_at: new Date().toISOString() })
    .eq('id', messageId)
    .select('id')
  if (error) {
    console.error('メッセージ編集エラー:', error)
    return { error: '編集に失敗しました' }
  }
  if (!data || data.length === 0) {
    return { error: '編集の権限がありません' }
  }
  revalidatePath(`/chat/${roomId}`)
  return { success: true }
}

export async function deleteMessage(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const messageId = formData.get('message_id')?.toString()
  const roomId = formData.get('room_id')?.toString()
  if (!messageId) return { error: 'メッセージが見つかりません' }
  const { data, error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)
    .select('id')
  if (error) {
    console.error('メッセージ削除エラー:', error)
    return { error: '削除に失敗しました' }
  }
  if (!data || data.length === 0) {
    return { error: '削除の権限がありません' }
  }
  revalidatePath(`/chat/${roomId}`)
  return { success: true }
}
