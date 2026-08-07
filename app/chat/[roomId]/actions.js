'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function sendMessage(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  const speakerType = formData.get('speaker_type')?.toString()
  const speakerId = formData.get('speaker_id')?.toString()
  const content = formData.get('content')?.toString().trim()
  if (!roomId || !content) return

  const locationMatch = content.match(/^\/場所\s+(.+)/)
  const timeMatch = content.match(/^\/時間帯\s+(.+)/)

  if (locationMatch) {
    const newLocation = locationMatch[1].trim()
    await supabase.from('chat_rooms').update({ location: newLocation }).eq('id', roomId)
    await supabase.from('room_setting_logs').insert({ room_id: roomId, field: 'location', value: newLocation, changed_by: user.id })
    await supabase.from('messages').insert({
      room_id: roomId,
      content: newLocation,
      is_system: true,
    })
    revalidatePath(`/chat/${roomId}`)
    return
  }
  if (timeMatch) {
    const newTime = timeMatch[1].trim()
    await supabase.from('chat_rooms').update({ time_period: newTime }).eq('id', roomId)
    await supabase.from('room_setting_logs').insert({ room_id: roomId, field: 'time_period', value: newTime, changed_by: user.id })
    await supabase.from('messages').insert({
      room_id: roomId,
      content: newTime,
      is_system: true,
    })
    revalidatePath(`/chat/${roomId}`)
    return
  }

  if (speakerType && speakerId) {
    await supabase.from('messages').insert({
      room_id: roomId,
      sender_oc_id: speakerType === 'oc' ? speakerId : null,
      sender_npc_id: speakerType === 'npc' ? speakerId : null,
      content,
    })
  }
  revalidatePath(`/chat/${roomId}`)
}
