'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function sendFriendRequestByToken(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const token = formData.get('token')?.toString()
  if (!token) redirect('/friends')
  const { data: owner } = await supabase
    .rpc('get_profile_by_invite_token', { _token: token })
    .single()
  if (owner && owner.id !== user.id) {
    await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: owner.id,
    })
  }
  redirect(`/friends/add/${token}`)
}

export async function respondToFriendRequest(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const friendshipId = formData.get('friendship_id')?.toString()
  const decision = formData.get('decision')?.toString()
  if (friendshipId && (decision === 'accepted' || decision === 'declined')) {
    await supabase
      .from('friendships')
      .update({ status: decision, responded_at: new Date().toISOString() })
      .eq('id', friendshipId)
      .eq('addressee_id', user.id)
  }
  revalidatePath('/friends')
}

export async function unfriendUser(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const otherId = formData.get('other_id')?.toString()
  const token = formData.get('token')?.toString()
  if (otherId) {
    await supabase
      .from('friendships')
      .delete()
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${user.id})`)
  }
  revalidatePath('/friends')
  if (token) redirect(`/friends/add/${token}`)
  redirect('/friends')
}
