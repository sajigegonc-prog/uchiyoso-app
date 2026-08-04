'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function sendLetter(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const senderOcId = formData.get('sender_oc_id')?.toString()
  const recipientOcId = formData.get('recipient_oc_id')?.toString()
  const content = formData.get('content')?.toString().trim()
  if (!senderOcId || !recipientOcId || !content) redirect('/owl/new')

  const { error } = await supabase.from('owl_letters').insert({
    sender_oc_id: senderOcId,
    recipient_oc_id: recipientOcId,
    content,
  })
  if (error) {
    console.error('フクロウ便送信エラー:', error)
  }
  revalidatePath('/owl')
  redirect('/owl')
}

export async function markLetterRead(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const letterId = formData.get('letter_id')?.toString()
  if (letterId) {
    await supabase.from('owl_letters').update({ read_at: new Date().toISOString() }).eq('id', letterId).is('read_at', null)
  }
  revalidatePath('/owl')
}
