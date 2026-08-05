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
  if (!messageId || !content) return
  const { error } = await supabase
    .from('messages')
    .update({ content, edited_at: new Date().toISOString() })
    .eq('id', messageId)
  if (error) console.error('メッセージ編集エラー:', error)
  revalidatePath(`/chat/${roomId}`)
}

export async function deleteMessage(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const messageId = formData.get('message_id')?.toString()
  const roomId = formData.get('room_id')?.toString()
  if (!messageId) return
  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)
  if (error) console.error('メッセージ削除エラー:', error)
  revalidatePath(`/chat/${roomId}`)
}
