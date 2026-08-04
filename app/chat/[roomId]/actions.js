'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'
export async function sendMessage(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  const senderOcId = formData.get('sender_oc_id')?.toString()
  const content = formData.get('content')?.toString().trim()
  if (roomId && senderOcId && content) {
    await supabase.from('messages').insert({
      room_id: roomId,
      sender_oc_id: senderOcId,
      content,
    })
  }
  revalidatePath(`/chat/${roomId}`)
}
