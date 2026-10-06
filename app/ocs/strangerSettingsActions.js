'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function setStrangerMatchEnabled(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const enabled = formData.get('enabled') === '1'
  await supabase.from('profiles').update({ stranger_match_enabled: enabled }).eq('id', user.id)
  revalidatePath('/ocs')
  revalidatePath('/chat/random')
}

export async function unblockUser(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const id = formData.get('id')?.toString()
  if (id) await supabase.from('user_blocks').delete().eq('id', id).eq('blocker_id', user.id)
  revalidatePath('/ocs')
}
