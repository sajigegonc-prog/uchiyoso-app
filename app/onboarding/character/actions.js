'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
export async function createFirstOC(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const name = formData.get('name')?.toString().trim()
  const ocType = formData.get('oc_type')?.toString() || 'creation'
  const pairedCharacter = formData.get('paired_character')?.toString().trim()
  const house = formData.get('house')?.toString().trim()
  const birthDate = formData.get('birth_date')?.toString()
  const description = formData.get('description')?.toString().trim()
  if (name) {
    await supabase.from('ocs').insert({
      user_id: user.id,
      name,
      oc_type: ocType,
      paired_character: pairedCharacter || null,
      house: house || null,
      birth_date: birthDate || null,
      description: description || null,
    })
  }
  await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
  redirect('/home')
}
export async function skipOnboarding() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
  redirect('/home')
}
