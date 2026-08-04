'use client'
import { useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import FrogChocolateButton from './FrogChocolateButton'
import OocPanel from './OocPanel'

function ClearOnDone({ inputRef }) {
  const { pending } = useFormStatus()
  const wasPending = useRef(false)
  if (wasPending.current && !pending && inputRef.current) {
    inputRef.current.value = ''
  }
  wasPending.current = pending
  return null
}

export default function MessageForm({ action, roomId, myOcs, npcs, myUserId, addNpcAction, deleteNpcAction }) {
  const inputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [speaker, setSpeaker] = useState({ type: 'oc', id: myOcs[0]?.id, name: myOcs[0]?.name })

  const avatarInitial = (speaker.name || '?').charAt(0)

  return (
    <div style={{ position: 'relative', background: '#fff', borderTop: '2px solid #8b6a4a' }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, right: 0,
          background: '#fbf5e9', borderTop: '2px solid #8b6a4a', borderBottom: '2px solid #8b6a4a',
          padding: 14, maxHeight: 260, overflowY: 'auto',
        }}>
          <div style={{ fontSize: 11.5, color: '#8b7355', fontWeight: 700, marginBottom: 8 }}>あなたのOC</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {myOcs.map((oc) => (
              <button
                key={oc.id}
                type="button"
                onClick={() => { setSpeaker({ type: 'oc', id: oc.id, name: oc.name }); setOpen(false) }}
                style={{
                  border: speaker.type === 'oc' && speaker.id === oc.id ? '2px solid #8b5a2b' : '2px solid #d8c7ac',
                  background: '#fff', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: '#241a10', cursor: 'pointer',
                }}
              >
                {oc.name}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 11.5, color: '#8b7355', fontWeight: 700, marginBottom: 8 }}>NPC</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {npcs.length === 0 && (
              <p style={{ fontSize: 12, color: '#b3a98f' }}>まだNPCがいません。</p>
            )}
            {npcs.map((npc) => (
              <span
                key={npc.id}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  border: speaker.type === 'npc' && speaker.id === npc.id ? '2px solid #8b5a2b' : '2px solid #d8c7ac',
                  background: '#fff', borderRadius: 20, padding: '4px 6px 4px 14px', fontSize: 13, color: '#241a10',
                }}
              >
                <button
                  type="button"
                  onClick={() => { setSpeaker({ type: 'npc', id: npc.id, name: npc.name }); setOpen(false) }}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#241a10', padding: 0 }}
                >
                  {npc.name}
                </button>
                {npc.created_by === myUserId && (
                  <form action={deleteNpcAction}>
                    <input type="hidden" name="room_id" value={roomId} />
                    <input type="hidden" name="npc_id" value={npc.id} />
                    <button type="submit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#b3a98f', fontSize: 13, padding: 0 }} aria-label="NPCを削除">
                      ×
                    </button>
                  </form>
                )}
              </span>
            ))}
          </div>

          <form action={addNpcAction} style={{ display: 'flex', gap: 6 }}>
            <input type="hidden" name="room_id" value={roomId} />
            <input
              name="name"
              placeholder="NPC名(例:マクゴナガル先生)"
              style={{ flex: 1, padding: '8px 10px', borderRadius: 3, fontSize: 13, border: '2px solid #d8c7ac', background: '#fff', color: '#241a10' }}
            />
            <button type="submit" style={{ border: 'none', borderRadius: 3, background: '#8b5a2b', color: '#f3e9d8', fontSize: 12.5, fontWeight: 700, padding: '0 14px', cursor: 'pointer' }}>
              追加
            </button>
          </form>
        </div>
      )}

      <form
        action={action}
        style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 16px' }}
      >
        <input type="hidden" name="room_id" value={roomId} />
        <input type="hidden" name="speaker_type" value={speaker.type} />
        <input type="hidden" name="speaker_id" value={speaker.id} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="話し手を切り替え"
          style={{
            flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
            border: '2px solid #8b6a4a', background: '#fbf5e9', color: '#241a10',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {avatarInitial}
        </button>
        <input
          ref={inputRef}
          name="content"
          placeholder={`${speaker.name || ''}として発言`}
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
    </div>
  )
}
