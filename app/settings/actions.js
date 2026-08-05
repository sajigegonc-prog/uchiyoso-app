'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export async function updateDisplayNameLimited(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const newName = formData.get('display_name')?.toString().trim()
  if (!newName) return { error: '表示名を入力してください' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name_changed_at')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.display_name_changed_at) {
    const last = new Date(profile.display_name_changed_at).getTime()
    const elapsed = Date.now() - last
    if (elapsed < THIRTY_DAYS_MS) {
      const remainingDays = Math.ceil((THIRTY_DAYS_MS - elapsed) / (24 * 60 * 60 * 1000))
      return { error: `表示名の変更は前回から30日経つまでできません。あと${remainingDays}日お待ちください。` }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: newName, display_name_changed_at: new Date().toISOString() })
    .eq('id', user.id)
  if (error) return { error: '変更に失敗しました' }

  revalidatePath('/home')
  revalidatePath('/settings/name')
  return { success: true }
}
