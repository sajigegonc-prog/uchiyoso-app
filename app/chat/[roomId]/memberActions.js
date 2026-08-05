'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function inviteMoreMembers(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  const friendOcIds = formData.getAll('friend_oc_ids').map((v) => v.toString())
  if (!roomId || friendOcIds.length === 0) return
  for (const ocId of friendOcIds) {
    const { data: oc } = await supabase.from('ocs').select('user_id').eq('id', ocId).maybeSingle()
    if (oc) {
      await supabase.from('chat_room_invitations').insert({
        room_id: roomId,
        inviter_id: user.id,
        invitee_id: oc.user_id,
        invitee_oc_id: ocId,
      })
    }
  }
  revalidatePath(`/chat/${roomId}`)
}
