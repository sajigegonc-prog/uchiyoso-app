'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function markHomeTutorialSeen() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('profiles').update({ seen_home_tutorial: true }).eq('id', user.id)
  revalidatePath('/home')
}

export async function markChatTutorialSeen(includedInvite) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const update = { seen_chat_tutorial: true }
  if (includedInvite) update.seen_invite_tutorial = true
  await supabase.from('profiles').update(update).eq('id', user.id)
  revalidatePath('/chat')
}

export async function markInviteTutorialSeen() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('profiles').update({ seen_invite_tutorial: true }).eq('id', user.id)
  revalidatePath('/chat')
}

export async function markUpdate1TutorialSeen() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('profiles').update({ seen_update1_tutorial: true }).eq('id', user.id)
  revalidatePath('/chat')
}

export async function markOocGachaTutorialSeen() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('profiles').update({ seen_ooc_gacha_tutorial: true }).eq('id', user.id)
}
