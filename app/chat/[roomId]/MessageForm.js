'use client'
import { useRef, useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import FrogChocolateButton from './FrogChocolateButton'
import SceneTransitionButton from './SceneTransitionButton'
import DeleteRoomButton from './DeleteRoomButton'
import OocPanel from './OocPanel'
import useTypingChannel from '@/lib/useTypingChannel'

function ClearOnDone({ inputRef, onClear }) {
  const { pending } = useFormStatus()
  const wasPending = useRef(false)
  if (wasPending.current && !pending && inputRef.current) {
    inputRef.current.value = ''
    onClear?.()
  }
  wasPending.current = pending
  return null
}

const LINE_HEIGHT = 20
const MAX_LINES = 5

export default function MessageForm({
  action, roomId, myOcs, npcs, myUserId, myDisplayName, addNpcAction, deleteNpcAction, frogAction,
  oocMessages, oocSendAction, hasUnreadOoc, drawSituationAction, proposeSituationAction, respondSituationAction, pendingSituation, initialOcId,
  sceneProps, deleteLabel, deleteAction, transcript, hasUnreadFrog, hasUnreadScene,
  showGachaTutorial, markGachaTutorialSeenAction, logAction, showLogTutorial, markLogTutorialSeenAction,
}) {
  const inputRef = useRef(null)
  const lastSentRef = useRef(0)
  const [cooldown, setCooldown] = useState(false)
  const { sendTyping } = useTypingChannel(`typing-${roomId}`, myUserId)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const oocOpen = searchParams.get('ooc') === '1'
  function setOocOpen(next) {
    if (next) {
      router.replace(`${pathname}?ooc=1`, { scroll: false })
    } else {
      router.replace(pathname, { scroll: false })
    }
  }
  const [extrasOpen, setExtrasOpen] = useState(true)
  const initialOc = myOcs.find((oc) => oc.id === initialOcId) || myOcs[0]
  const [speaker, setSpeaker] = useState({ type: 'oc', id: initialOc?.id, name: initialOc?.name })

  const avatarInitial = (speaker.name || '?').charAt(0)

  function autoResize() {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    const maxHeight = LINE_HEIGHT * MAX_LINES + 16
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
  }

  function handleFormSubmit(e) {
    const now = Date.now()
    if (now - lastSentRef.current < 2000) {
      e.preventDefault()
      return
    }
    lastSentRef.current = now
    setCooldown(true)
    setTimeout(() => setCooldown(false), 2000)
  }
  
  useEffect(() => {
    autoResize()
  }, [])

  return (
    <div style={{ position: 'relative', flexShrink: 0, background: '#fff', borderTop: '1px solid #211d17' }}>
      {oocOpen && (
        <OocPanel
          roomId={roomId} myUserId={myUserId} myDisplayName={myDisplayName} messages={oocMessages} sendAction={oocSendAction}
          onClose={() => setOocOpen(false)}
          drawAction={drawSituationAction} proposeAction={proposeSituationAction} respondAction={respondSituationAction}
          pendingSituation={pendingSituation}
          showGachaTutorial={showGachaTutorial} markGachaTutorialSeenAction={markGachaTutorialSeenAction}
          logAction={logAction}
          showLogTutorial={showLogTutorial} markLogTutorialSeenAction={markLogTutorialSeenAction}
        />
      )}

      {open && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, right: 0,
          background: '#f4eee0', borderTop: '1px solid #211d17', borderBottom: '1px solid #211d17',
          padding: 14, maxHeight: 260, overflowY: 'auto',
        }}>
          <div style={{ fontSize: 11, color: '#6b6250', fontWeight: 700, marginBottom: 8, letterSpacing: '.05em' }}>あなたのOC</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {myOcs.map((oc) => (
              <button
                key={oc.id}
                type="button"
                onClick={() => { setSpeaker({ type: 'oc', id: oc.id, name: oc.name }); setOpen(false) }}
                style={{
                  border: speaker.type === 'oc' && speaker.id === oc.id ? '1px solid #211d17' : '1px solid #8a8168',
                  background: speaker.type === 'oc' && speaker.id === oc.id ? '#211d17' : '#fff',
                  color: speaker.type === 'oc' && speaker.id === oc.id ? '#f4eee0' : '#211d17',
                  padding: '6px 14px', fontSize: 13, cursor: 'pointer',
                }}
              >
                {oc.name}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 11, color: '#6b6250', fontWeight: 700, marginBottom: 8, letterSpacing: '.05em' }}>NPC</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {npcs.length === 0 && (
              <p style={{ fontSize: 12, color: '#8a8168', fontStyle: 'italic' }}>まだNPCがいません。</p>
            )}
            {npcs.map((npc) => (
              <span
                key={npc.id}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  border: speaker.type === 'npc' && speaker.id === npc.id ? '1px solid #211d17' : '1px solid #8a8168',
                  background: '#fff', padding: '4px 6px 4px 14px', fontSize: 13, color: '#211d17',
                }}
              >
                <button
                  type="button"
                  onClick={() => { setSpeaker({ type: 'npc', id: npc.id, name: npc.name }); setOpen(false) }}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#211d17', padding: 0 }}
                >
                  {npc.name}
                </button>
                {npc.created_by === myUserId && (
                  <form action={deleteNpcAction}>
                    <input type="hidden" name="room_id" value={roomId} />
                    <input type="hidden" name="npc_id" value={npc.id} />
                    <button type="submit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8a8168', fontSize: 13, padding: 0 }} aria-label="NPCを削除">
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
              style={{ flex: 1, padding: '8px 10px', fontSize: 13, border: '1px solid #8a8168', background: '#fff', color: '#211d17' }}
            />
            <button type="submit" style={{ border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontSize: 12.5, fontWeight: 700, padding: '0 14px', cursor: 'pointer' }}>
              追加
            </button>
          </form>
        </div>
      )}

      <div style={{
        maxHeight: extrasOpen ? 120 : 0,
        opacity: extrasOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height .4s cubic-bezier(.4,0,.2,1), opacity .3s ease',
        background: 'rgba(244,238,224,.88)',
        borderBottom: extrasOpen ? '1px solid #211d17' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px', gap: 10 }}>
          <div style={{
            display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0,
            overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 2,
          }}>
            <FrogChocolateButton roomId={roomId} action={frogAction} speakerName={speaker.name} hasUnread={hasUnreadFrog} />
                        <SceneTransitionButton
              roomId={roomId}
              pending={sceneProps?.pending}
              alreadyApproved={sceneProps?.alreadyApproved}
              requestedByName={sceneProps?.requestedByName}
              isRequester={sceneProps?.isRequester}
              hasUnread={hasUnreadScene}
            />
            <button
              id="coach-ooc-btn"
              type="button"
              onClick={() => setOocOpen(true)}
              style={{
                position: 'relative', flexShrink: 0, fontSize: 12.5, color: '#211d17', background: '#fff',
                border: '1px solid #211d17', borderRadius: 4, padding: '0 14px', height: 36, cursor: 'pointer',
              }}
            >
              中の人チャットへ
              {hasUnreadOoc && (
                <span style={{
                  position: 'absolute', top: -2, right: -10,
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#8a2418',
                }} />
              )}
            </button>
          </div>
          <div style={{ flexShrink: 0 }}>
            <DeleteRoomButton roomId={roomId} label={deleteLabel} action={deleteAction} transcript={transcript} />
          </div>
        </div>
      </div>

      <form
        action={action}
        onSubmit={handleFormSubmit}
        style={{ display: 'flex', gap: 6, alignItems: 'flex-end', padding: '10px 12px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}
      >
        <input type="hidden" name="room_id" value={roomId} />
        <input type="hidden" name="speaker_type" value={speaker.type} />
        <input type="hidden" name="speaker_id" value={speaker.id} />
        <button
          id="coach-speaker-btn"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="話し手を切り替え"
          style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
            border: '1px solid #211d17', background: '#f4eee0', color: '#211d17',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 2,
          }}
        >
          {avatarInitial}
        </button>
        <textarea
          ref={inputRef}
          name="content"
          rows={1}
          placeholder={`${speaker.name || ''}として発言`}
          onFocus={() => setExtrasOpen(false)}
          onInput={() => { autoResize(); sendTyping(speaker.name) }} 
          style={{
            flex: 1, border: '1px solid #211d17', padding: '8px 10px', fontSize: 16,
            fontFamily: "'BIZ UDPGothic', sans-serif", background: '#fff', color: '#211d17',
            resize: 'none', overflowY: 'auto', lineHeight: `${LINE_HEIGHT}px`,
          }}
        />
        <button
          type="submit"
          disabled={cooldown}
          style={{
            flexShrink: 0, border: '1px solid #211d17', padding: '8px 12px',
            background: cooldown ? '#8a8168' : '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 13,
            marginBottom: 2, cursor: cooldown ? 'default' : 'pointer',
          }}
        >
          送信
        </button>
        <button
          id="coach-menu-toggle-btn"
          type="button"
          onClick={() => setExtrasOpen((v) => !v)}
          aria-label="メニューの開閉"
          style={{
            position: 'relative', flexShrink: 0, width: 28, height: 36, border: 'none', background: 'none',
            color: '#6b6250', fontSize: 13, cursor: 'pointer', marginBottom: 2,
            transition: 'transform .3s ease',
            transform: extrasOpen ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        >
          ▼
          {!extrasOpen && (hasUnreadOoc || hasUnreadFrog || hasUnreadScene) && (
            <span style={{
              position: 'absolute', top: 4, right: 2,
              width: 7, height: 7, borderRadius: '50%',
              background: '#8a2418',
            }} />
          )}
        </button>
        <ClearOnDone inputRef={inputRef} onClear={autoResize} />
      </form>
    </div>
  )
}
