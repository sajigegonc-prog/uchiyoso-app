// 「知らない人とのマッチ」で作られた部屋の、表示名まわりの共通処理

// この部屋で、自分から見て「まだ友達になっていない相手」がいるか
export async function hasNonFriendMember(supabase, userId, roomId) {
  const { data: room } = await supabase.from('chat_rooms').select('stranger_match').eq('id', roomId).maybeSingle()
  if (!room?.stranger_match) return false
  const { data: members } = await supabase
    .from('chat_room_members')
    .select('user_id')
    .eq('room_id', roomId)
    .is('left_at', null)
    .neq('user_id', userId)
  const others = [...new Set((members || []).map((m) => m.user_id))]
  for (const other of others) {
    const { data: isFriend } = await supabase.rpc('is_friend', { _a: userId, _b: other })
    if (!isFriend) return true
  }
  return false
}

// 通知文などに入れる自分の呼び名。友達になる前は表示名の代わりにOC名を使う
export async function getActorLabel(supabase, userId, roomId, t) {
  if (roomId && (await hasNonFriendMember(supabase, userId, roomId))) {
    const { data: member } = await supabase
      .from('chat_room_members')
      .select('ocs(name)')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .is('left_at', null)
      .limit(1)
      .maybeSingle()
    if (member?.ocs?.name) return member.ocs.name
  }
  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle()
  return profile?.display_name || t('名前未設定')
}
