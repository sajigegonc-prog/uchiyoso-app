'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function updateOC(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const id = formData.get('id')?.toString()
  const name = formData.get('name')?.toString().trim()
  const ocType = formData.get('oc_type')?.toString() || 'creation'
  const pairedCharacter = formData.get('paired_character')?.toString().trim()
  const house = formData.get('house')?.toString().trim()
  const career = formData.get('career')?.toString().trim()
  const birthDate = formData.get('birth_date')?.toString()
  const description = formData.get('description')?.toString().trim()
  if (id && name) {
    await supabase.from('ocs').update({
      name,
      oc_type: ocType,
      paired_character: pairedCharacter || null,
      house: house || null,
      career: career || null,
      birth_date: birthDate || null,
      description: description || null,
    }).eq('id', id).eq('user_id', user.id)
  }
  revalidatePath('/ocs')
  redirect('/ocs')
}

export async function deleteOC(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const id = formData.get('id')?.toString()
  if (id) {
    await supabase.from('ocs').delete().eq('id', id).eq('user_id', user.id)
  }
  revalidatePath('/ocs')
  redirect('/ocs')
}

export async function updateOcIcon(ocId, url) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return
  await supabase.from('ocs').update({ icon_url: url }).eq('id', ocId).eq('user_id', user.id)
  revalidatePath(`/ocs/${ocId}`)
  revalidatePath('/ocs')
}
