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
    .from('dream_partners')
    .select('id, icon_url')
    .eq('user_id', user.id)
    .maybeSingle()

  const { error } = await supabase
    .from('dream_partners')
    .upsert({
      user_id: user.id,
      name,
      icon_url: iconUrl || existing?.icon_url || null,
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('夢相手保存エラー:', error)
    return { error: '保存に失敗しました' }
  }
  revalidatePath('/ocs')
  return { success: true }
}

export async function deleteDreamPartner() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  await supabase.from('dream_partners').delete().eq('user_id', user.id)
  revalidatePath('/ocs')
  return { success: true }
}
