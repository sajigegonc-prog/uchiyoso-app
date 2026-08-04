'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function sendOocMessage(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  const content = formData.get('content')?.toString().trim()
  if (roomId && content) {
    await supabase.from('room_ooc_messages').insert({
      room_id: roomId,
      user_id: user.id,
      content,
    })
  }
  revalidatePath(`/chat/${roomId}`)
}

export async function openFrogCard(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  if (!roomId) return

  const { count } = await supabase
    .from('frog_cards')
    .select('id', { count: 'exact', head: true })
  const randomOffset = Math.floor(Math.random() * (count || 1))
  const { data: cards } = await supabase
    .from('frog_cards')
    .select('name, description')
    .range(randomOffset, randomOffset)

  const card = cards?.[0]
  if (card) {
    await supabase.from('room_ooc_messages').insert({
      room_id: roomId,
      user_id: user.id,
      content: `🐸 蛙チョコを開けました → ${card.name}\n${card.description}`,
      is_system: true,
    })
  }
  revalidatePath(`/chat/${roomId}`)
}
