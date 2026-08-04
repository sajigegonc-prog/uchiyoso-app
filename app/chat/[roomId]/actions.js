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

  // コマンド判定
  const locationMatch = content.match(/^\/場所\s+(.+)/)
  const timeMatch = content.match(/^\/時間帯\s+(.+)/)

  if (locationMatch) {
    const newLocation = locationMatch[1].trim()
    const { error: e1 } = await supabase.from('chat_rooms').update({ location: newLocation }).eq('id', roomId)
    if (e1) console.error('場所更新エラー:', e1)
    const { error: e2 } = await supabase.from('room_setting_logs').insert({ room_id: roomId, field: 'location', value: newLocation, changed_by: user.id })
    if (e2) console.error('設定ログ挿入エラー:', e2)
    const { error: e3 } = await supabase.from('room_ooc_messages').insert({
      room_id: roomId,
      user_id: user.id,
      content: `📍 場所が変更されました → ${newLocation}`,
      is_system: true,
    })
    if (e3) console.error('中の人チャットログ挿入エラー:', e3)
    revalidatePath(`/chat/${roomId}`)
    return
  }
  if (timeMatch) {
    const newTime = timeMatch[1].trim()
    const { error: e1 } = await supabase.from('chat_rooms').update({ time_period: newTime }).eq('id', roomId)
    if (e1) console.error('時間帯更新エラー:', e1)
    const { error: e2 } = await supabase.from('room_setting_logs').insert({ room_id: roomId, field: 'time_period', value: newTime, changed_by: user.id })
    if (e2) console.error('設定ログ挿入エラー:', e2)
    const { error: e3 } = await supabase.from('room_ooc_messages').insert({
      room_id: roomId,
      user_id: user.id,
      content: `🕐 時間帯が変更されました → ${newTime}`,
      is_system: true,
    })
    if (e3) console.error('中の人チャットログ挿入エラー:', e3)
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
