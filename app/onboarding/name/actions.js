'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
export async function updateDisplayName(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const displayName = formData.get('display_name')?.toString().trim()
  if (displayName) {
    const { data: duplicate } = await supabase
      .from('profiles')
      .select('id')
      .eq('display_name', displayName)
      .neq('id', user.id)
      .maybeSingle()
    if (duplicate) {
      return { error: 'その表示名はすでに使われています。別の名前を入力してください。' }
    }
  }
  await supabase
    .from('profiles')
    .update({ display_name: displayName || null })
    .eq('id', user.id)
  redirect('/onboarding/character')
}
