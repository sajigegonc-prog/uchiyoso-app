'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
export async function resetAccount() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  await supabase.from('ocs').delete().eq('user_id', user.id)
  await supabase
    .from('profiles')
    .update({ onboarding_completed: false })
    .eq('id', user.id)
  redirect('/onboarding/name')
}
export async function signOutAndReset() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (user) {
    await supabase.from('ocs').delete().eq('user_id', user.id)
    await supabase
      .from('profiles')
      .update({ onboarding_completed: false, display_name: null })
      .eq('id', user.id)
  }
  await supabase.auth.signOut()
  redirect('/')
}
export async function signOutOnly() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
