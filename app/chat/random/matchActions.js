'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { createRoom } from '../actions'

export async function confirmRandomMatch(formData) {
  const myOcId = formData.get('my_oc_id')?.toString()
  const friendOcId = formData.get('friend_oc_id')?.toString()
  const location = formData.get('location')?.toString()
  const timePeriod = formData.get('time_period')?.toString()
  const situationText = formData.get('situation_text')?.toString()

  const roomForm = new FormData()
  roomForm.set('oc_id', myOcId)
  roomForm.set('room_type', 'friend_1on1')
  roomForm.set('location', location)
  roomForm.set('time_period', timePeriod)
  roomForm.append('friend_oc_ids', friendOcId)

  const result = await createRoom(roomForm)
  if (result?.error) return result

  const supabase = await createClient()
  await supabase.from('messages').insert({
    room_id: result.id, is_system: true, content: `【ランダムマッチング】${situationText}`,
  })
  redirect(`/chat/${result.id}`)
}
