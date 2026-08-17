'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'
import { buildTranscriptText } from './transcriptUtil'

async function generateTranscript(supabase, roomId, viewerId) {
  const { data: room } = await supabase.from('chat_rooms').select('room_type, primary_oc_id').eq('id', roomId).maybeSingle()
  const { data: myOcs } = await supabase.from('ocs').select('id').eq('user_id', viewerId)
  const myOcIds = new Set((myOcs || []).map((o) => o.id))

  const { data: messages } = await supabase
    .from('messages')
    .select('content, created_at, sender_oc_id, sender_npc_id, is_system, deleted_at, ocs(name), chat_room_npcs(name)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  return buildTranscriptText(messages, myOcIds, { roomType: room?.room_type, primaryOcId: room?.primary_oc_id })
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
    await supabase.from('room_ooc_messages').insert({
      room_id: roomId, user_id: null, is_system: true, log_type: 'scene_transition',
      content: '場面転換が完了しました',
    })
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
  const transcript = await generateTranscript(supabase, roomId, user.id)
  await supabase.from('scene_transition_approvals').delete().eq('room_id', roomId)
  await supabase.from('chat_rooms').update({
    transition_requested_at: new Date().toISOString(),
    transition_requested_by: user.id,
  }).eq('id', roomId)
  await supabase.from('scene_transition_approvals').insert({ room_id: roomId, user_id: user.id })
  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
  await supabase.from('room_ooc_messages').insert({
    room_id: roomId, user_id: user.id, is_system: true, log_type: 'scene_transition',
    content: `${profile?.display_name || '名前未設定'}さんが場面転換を申請しました`,
  })

    const completed = await checkAndComplete(supabase, roomId)

  return { transcript, completed }
}

export async function approveSceneTransition(roomId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const transcript = await generateTranscript(supabase, roomId, user.id)
  await supabase.from('scene_transition_approvals').insert({ room_id: roomId, user_id: user.id })

  const completed = await checkAndComplete(supabase, roomId)

  return { transcript, completed }
}

export async function cancelSceneTransition(roomId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: updated } = await supabase.from('chat_rooms').update({
    transition_requested_at: null,
    transition_requested_by: null,
  }).eq('id', roomId).eq('transition_requested_by', user.id).select('id')
  if (!updated || updated.length === 0) return { success: true }
  await supabase.from('scene_transition_approvals').delete().eq('room_id', roomId)
  await supabase.from('room_ooc_messages').insert({
    room_id: roomId, user_id: user.id, is_system: true,
    content: '場面転換の申請が取り消されました',
  })
  return { success: true }
}
