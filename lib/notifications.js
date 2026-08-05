export async function getNotifications(supabase, userId) {
  const { data: pendingInvites } = await supabase
    .from('chat_room_invitations')
    .select('id')
    .eq('invitee_id', userId)
    .eq('status', 'pending')
    .limit(1)

  const { data: memberships } = await supabase
    .from('chat_room_members')
    .select('room_id, oc_id, last_read_at')
    .eq('user_id', userId)
    .is('left_at', null)

  let hasUnreadMessage = false
  if (memberships && memberships.length > 0) {
    const roomIds = [...new Set(memberships.map((m) => m.room_id))]

    const { data: allActiveMembers } = await supabase
      .from('chat_room_members')
      .select('room_id, user_id')
      .in('room_id', roomIds)
      .is('left_at', null)
    const uniqueUsersByRoom = new Map()
    for (const m of allActiveMembers || []) {
      if (!uniqueUsersByRoom.has(m.room_id)) uniqueUsersByRoom.set(m.room_id, new Set())
      uniqueUsersByRoom.get(m.room_id).add(m.user_id)
    }
    const selfOnlyRooms = new Set(
      roomIds.filter((id) => (uniqueUsersByRoom.get(id)?.size || 1) <= 1)
    )

    const { data: latestMessages } = await supabase
      .from('messages')
      .select('room_id, sender_oc_id, is_system, created_at')
      .in('room_id', roomIds)
      .eq('is_system', false)
      .order('created_at', { ascending: false })

    const myOcIds = new Set(memberships.map((m) => m.oc_id))
    const lastReadByRoom = new Map()
    for (const m of memberships) {
      const existing = lastReadByRoom.get(m.room_id)
      if (!existing || (m.last_read_at && m.last_read_at > existing)) {
        lastReadByRoom.set(m.room_id, m.last_read_at)
      }
    }
    const seenRoom = new Set()
    for (const msg of latestMessages || []) {
      if (seenRoom.has(msg.room_id)) continue
      seenRoom.add(msg.room_id)
      if (selfOnlyRooms.has(msg.room_id)) continue
      if (myOcIds.has(msg.sender_oc_id)) continue
      const lastRead = lastReadByRoom.get(msg.room_id)
      if (!lastRead || new Date(msg.created_at) > new Date(lastRead)) {
        hasUnreadMessage = true
        break
      }
    }
  }

  const { data: myOcs } = await supabase.from('ocs').select('id').eq('user_id', userId)
  const myOcIdsForOwl = (myOcs || []).map((oc) => oc.id)
  let hasUnreadLetter = false
  if (myOcIdsForOwl.length > 0) {
    const { data: unreadLetters } = await supabase
      .from('owl_letters')
      .select('id')
      .in('recipient_oc_id', myOcIdsForOwl)
      .is('read_at', null)
      .limit(1)
    hasUnreadLetter = (unreadLetters?.length || 0) > 0
  }

  return {
    chat: hasUnreadMessage || (pendingInvites && pendingInvites.length > 0),
    owl: hasUnreadLetter,
    matching: false,
  }
}
