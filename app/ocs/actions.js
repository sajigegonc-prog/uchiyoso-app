'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'
export async function addOC(formData) {
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
  redirect('/home')
}
export async function addAvoidedPartner(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const name = formData.get('character_name')?.toString().trim()
  if (name) {
    await supabase.from('avoided_partners').insert({
      user_id: user.id,
      character_name: name,
    })
  }
  revalidatePath('/ocs')
}

export async function removeAvoidedPartner(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const id = formData.get('id')?.toString()
  if (id) {
    await supabase.from('avoided_partners').delete().eq('id', id).eq('user_id', user.id)
  }
  revalidatePath('/ocs')
}
