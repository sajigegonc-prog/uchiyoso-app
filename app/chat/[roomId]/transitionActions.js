'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

async function generateTranscript(supabase, roomId) {
  const { data: messages } = await supabase
    .from('messages')
    .select('content, created_at, sender_oc_id, sender_npc_id, is_system, ocs(name), chat_room_npcs(name)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
  const lines = (messages || []).map((m) => {
    if (m.is_system) return `（${m.content}）`
    const speaker = m.ocs?.name || m.chat_room_npcs?.name || '???'
    return `${speaker}: ${m.content}`
  })
  return lines.join('\n')
}

async function checkAndComplete(supabase, roomId) {
  const { data: activeMembers } = await supabase
    .from('chat_room_members')
    .select('user_id')
    .eq('room_id', roomId)
    .is('left_at', null)
  const activeUserIds = [...new Set((activeMembers || []).map((m) => m.user_id))]

  const { data: approvals } = await supabase
    .from('scene_transition_approvals')
    .select('user_id')
    .eq('room_id', roomId)
  const approvedUserIds = new Set((approvals || []).map((a) => a.user_id))

  const allApproved = activeUserIds.every((id) => approvedUserIds.has(id))

  if (allApproved) {
    await supabase.from('messages').delete().eq('room_id', roomId)
    await supabase.from('chat_rooms').update({
      location: null,
      time_period: null,
      transition_requested_at: null,
      transition_requested_by: null,
    }).eq('id', roomId)
    await supabase.from('scene_transition_approvals').delete().eq('room_id', roomId)
  }

  return allApproved
}

export async function requestSceneTransition(roomId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const transcript = await generateTranscript(supabase, roomId)
  await supabase.from('scene_transition_approvals').delete().eq('room_id', roomId)
  await supabase.from('chat_rooms').update({
    transition_requested_at: new Date().toISOString(),
    transition_requested_by: user.id,
  }).eq('id', roomId)
  await supabase.from('scene_transition_approvals').insert({ room_id: roomId, user_id: user.id })

  const completed = await checkAndComplete(supabase, roomId)

  revalidatePath(`/chat/${roomId}`)
  return { transcript, completed }
}

export async function approveSceneTransition(roomId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const transcript = await generateTranscript(supabase, roomId)
  await supabase.from('scene_transition_approvals').insert({ room_id: roomId, user_id: user.id })

  const completed = await checkAndComplete(supabase, roomId)

  revalidatePath(`/chat/${roomId}`)
  return { transcript, completed }
}
