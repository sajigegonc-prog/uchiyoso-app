'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function saveDreamPartner(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const name = formData.get('name')?.toString().trim()
  const iconUrl = formData.get('icon_url')?.toString()
  if (!name) return { error: 'お名前を入力してください' }

  const { data: existing } = await supabase
    .from('ocs')
    .select('id, icon_url')
    .eq('user_id', user.id)
    .eq('is_dream_partner', true)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('ocs')
      .update({ name, icon_url: iconUrl || existing.icon_url || null })
      .eq('id', existing.id)
    if (error) {
      console.error('夢相手更新エラー:', error)
      return { error: '保存に失敗しました' }
    }
  } else {
    const { error } = await supabase
      .from('ocs')
      .insert({ user_id: user.id, name, icon_url: iconUrl || null, is_dream_partner: true })
    if (error) {
      console.error('夢相手登録エラー:', error)
      return { error: '保存に失敗しました' }
    }
  }
  revalidatePath('/ocs')
  return { success: true }
}

export async function deleteDreamPartner() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  await supabase.from('ocs').delete().eq('user_id', user.id).eq('is_dream_partner', true)
  revalidatePath('/ocs')
  return { success: true }
}
