'use client'
import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
function ClearOnDone({ inputRef }) {
  const { pending } = useFormStatus()
  const wasPending = useRef(false)
  if (wasPending.current && !pending && inputRef.current) {
    inputRef.current.value = ''
  }
  wasPending.current = pending
  return null
}
export default function MessageForm({ action, roomId, myOcs }) {
  const inputRef = useRef(null)
  return (
    <form
      action={action}
      style={{
        display: 'flex', gap: 8, alignItems: 'center', padding: '12px 16px',
        background: '#fff', borderTop: '2px solid #8b6a4a',
      }}
    >
      <input type="hidden" name="room_id" value={roomId} />
      {myOcs.length > 1 ? (
        <select
          name="sender_oc_id"
          defaultValue={myOcs[0].id}
          style={{
            border: '2px solid #8b6a4a', borderRadius: 3, padding: '8px 6px', fontSize: 12,
            background: '#fbf5e9', color: '#241a10', flexShrink: 0,
          }}
        >
          {myOcs.map((oc) => (
            <option key={oc.id} value={oc.id}>{oc.name}</option>
          ))}
        </select>
      ) : (
        <input type="hidden" name="sender_oc_id" value={myOcs[0]?.id} />
      )}
      <input
        ref={inputRef}
        name="content"
        placeholder="メッセージージを入力"
        style={{
          flex: 1, border: '2px solid #8b6a4a', borderRadius: 3, padding: '10px 12px', fontSize: 16,
          fontFamily: "'BIZ UDPGothic', sans-serif", background: '#fbf5e9', color: '#241a10',
        }}
      />
      <button
        type="submit"
        style={{
          flexShrink: 0, border: '2px solid #3d2717', borderRadius: 3, padding: '10px 14px',
          background: '#8b5a2b', color: '#f3e9d8', fontWeight: 700, fontSize: 13, boxShadow: '0 3px 0 #3d2717',
        }}
      >
        送信
      </button>
      <ClearOnDone inputRef={inputRef} />
    </form>
  )
}
