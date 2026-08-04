'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
export async function updateDisplayName(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const displayName = formData.get('display_name')?.toString().trim()
  await supabase
    .from('profiles')
    .update({ display_name: displayName || null })
    .eq('id', user.id)
  redirect('/onboarding/character')
}
