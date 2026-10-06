'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'
import { getT } from '@/lib/i18n/server'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export async function updateDisplayNameLimited(formData) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const newName = formData.get('display_name')?.toString().trim()
  if (!newName) return { error: t('表示名を入力してください') }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name_changed_at')
    .eq('id', user.id)
    .maybeSingle()

  const { data: duplicate } = await supabase
    .from('profiles')
    .select('id')
    .eq('display_name', newName)
    .neq('id', user.id)
    .maybeSingle()
  if (duplicate) {
    return { error: t('その表示名はすでに使われています。別の名前を入力してください。') }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: newName, display_name_changed_at: new Date().toISOString() })
    .eq('id', user.id)
  if (error) return { error: t('変更に失敗しました') }

  revalidatePath('/home')
  revalidatePath('/settings/name')
  return { success: true }
}
