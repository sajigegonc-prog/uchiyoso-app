export function buildTranscriptText(messages, myOcIdSet) {
  const lines = (messages || []).map((m) => {
    if (m.is_system) return `（${m.content}）`
    const speaker = m.ocs?.name || m.chat_room_npcs?.name || '???'
    const mark = m.sender_oc_id && myOcIdSet.has(m.sender_oc_id) ? '★' : ''
    return `${mark}${speaker}: ${m.content}`
  })
  return lines.join('\n')
}
