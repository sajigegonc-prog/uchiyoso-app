'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function addNpc(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  const name = formData.get('name')?.toString().trim()
  if (roomId && name) {
    await supabase.from('chat_room_npcs').insert({
      room_id: roomId,
      name,
      created_by: user.id,
    })
  }
  revalidatePath(`/chat/${roomId}`)
}

export async function deleteNpc(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  const npcId = formData.get('npc_id')?.toString()
  if (npcId) {
    await supabase.from('chat_room_npcs').delete().eq('id', npcId).eq('created_by', user.id)
  }
  revalidatePath(`/chat/${roomId}`)
}
