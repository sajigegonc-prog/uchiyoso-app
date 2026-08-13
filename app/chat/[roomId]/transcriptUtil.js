export function buildTranscriptText(messages, myOcIdSet, options = {}) {
  const { roomType, primaryOcId } = options
  const lines = (messages || [])
    .filter((m) => !m.deleted_at)
    .map((m) => {
      if (m.is_system) return `（${m.content}）`
      const speaker = m.ocs?.name || m.chat_room_npcs?.name || '???'
      const isMine = roomType === 'self'
        ? !!m.sender_oc_id && m.sender_oc_id === primaryOcId
        : (m.sender_oc_id && myOcIdSet.has(m.sender_oc_id))
      const mark = isMine ? '★' : ''
      return `${mark}${speaker}: ${m.content}`
    })
  return lines.join('\n')
}
