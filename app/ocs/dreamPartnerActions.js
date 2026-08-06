'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function saveDreamPartner(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const id = formData.get('id')?.toString()
  const name = formData.get('name')?.toString().trim()
  const pairedOcId = formData.get('paired_with_oc_id')?.toString()
  const iconUrl = formData.get('icon_url')?.toString()

  if (!name) return { error: 'お名前を入力してください' }
  if (!pairedOcId) return { error: 'どのOCのお相手か選んでください' }

  if (id) {
    const { data: existing } = await supabase.from('ocs').select('icon_url').eq('id', id).maybeSingle()
    const { error } = await supabase
      .from('ocs')
      .update({ name, paired_with_oc_id: pairedOcId, icon_url: iconUrl || existing?.icon_url || null })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return { error: '保存に失敗しました' }
    revalidatePath('/ocs')
    return { success: true, id }
  }

  const { count: dreamerCount } = await supabase
    .from('ocs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('oc_type', 'dreamer')
    .eq('is_dream_partner', false)

  const { count: currentPartnersCount } = await supabase
    .from('ocs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_dream_partner', true)

  if ((currentPartnersCount || 0) >= (dreamerCount || 0)) {
    return { error: '登録できるお相手は、夢主OCの人数分までです。' }
  }

  const { data, error } = await supabase
    .from('ocs')
    .insert({ user_id: user.id, name, icon_url: iconUrl || null, is_dream_partner: true, paired_with_oc_id: pairedOcId, oc_type: 'creation' })
    .select('id')
    .single()
  if (error) return { error: '保存に失敗しました' }
  revalidatePath('/ocs')
  return { success: true, id: data.id }
}

export async function deleteDreamPartner(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const id = formData.get('id')?.toString()
  if (!id) return
  await supabase.from('ocs').delete().eq('id', id).eq('user_id', user.id).eq('is_dream_partner', true)
  revalidatePath('/ocs')
  return { success: true }
}
