'use client'
import { useState } from 'react'

function parseTranscript(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  return lines.map((line) => {
    const systemMatch = line.match(/^（(.+)）$/)
    if (systemMatch) {
      return { isSystem: true, content: systemMatch[1] }
    }
    const isMine = line.startsWith('★')
    const body = isMine ? line.slice(1) : line
    const idx = body.indexOf(': ')
    if (idx === -1) {
      return { isSystem: true, content: body }
    }
    const speaker = body.slice(0, idx).trim()
    const content = body.slice(idx + 2).trim()
    return { isSystem: false, speaker, content, isMine }
  })
}

function renderWithBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <b key={i}>{part.slice(2, -2)}</b>
    }
    return part
  })
}

export default function ReplayClient({ myOcs, allKnownOcs }) {
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState(null)

  function ocFor(speakerName) {
    return (allKnownOcs || myOcs).find((oc) => oc.name === speakerName)
  }

  function handleParse() {
    setParsed(parseTranscript(raw))
  }

  function handleReset() {
    setParsed(null)
    setRaw('')
  }

  return (
    <div style={{ marginTop: 20 }}>
      {!parsed ? (
        <>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={'ここにログを貼り付けてください\n例:\n★ミラ・トウドウ: おはよう\nアダリン・ロイド: おはようございます'}
            style={{
              width: '100%', minHeight: 220, padding: 14, fontSize: 13, lineHeight: 1.8,
              border: '1px solid #211d17', background: '#fff', color: '#211d17',
              resize: 'vertical', boxSizing: 'border-box', fontFamily: "'BIZ UDPGothic', sans-serif",
            }}
          />
          <button
            type="button"
            onClick={handleParse}
            disabled={!raw.trim()}
            style={{
              display: 'block', width: '100%', marginTop: 12, padding: 13,
              border: '1px solid #211d17', background: '#211d17', color: '#f4eee0',
              fontWeight: 700, fontSize: 14, letterSpacing: '.05em', cursor: 'pointer',
            }}
          >
            再現する
          </button>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              type="button"
              onClick={handleReset}
              style={{ fontSize: 11, color: '#6b6250', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
            >
              クリアして貼り直す
            </button>
          </div>

          <div style={{
            background: '#eee1cb', border: '1px solid #211d17', padding: '18px 14px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {parsed.length === 0 && (
              <p style={{ fontSize: 12.5, color: '#8a8168', textAlign: 'center', fontStyle: 'italic' }}>内容が読み取れませんでした。</p>
            )}
            {parsed.map((line, i) => {
              if (line.isSystem) {
                return (
                  <div key={i} style={{ textAlign: 'center', fontSize: 11, color: '#8a8168', fontStyle: 'italic' }}>
                    — {line.content} —
                  </div>
                )
              }
              const mine = line.isMine
              const oc = ocFor(line.speaker)
              const prevLine = parsed[i - 1]
              const showName = !prevLine || prevLine.isSystem || prevLine.speaker !== line.speaker
              return (
                <div key={i} style={{
                  display: 'flex', gap: 8, alignItems: 'flex-end',
                  flexDirection: mine ? 'row-reverse' : 'row',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                    background: '#211d17', border: '1px solid #211d17',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#f4eee0', fontWeight: 700, fontSize: 12, fontFamily: 'Georgia, serif',
                  }}>
                    {oc?.icon_url ? (
                      <img src={oc.icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (line.speaker || '?').charAt(0)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
                    {!mine && showName && (
                      <div style={{ fontSize: 10.5, color: '#6b6250', marginBottom: 3, fontStyle: 'italic' }}>{line.speaker}</div>
                    )}
                    <div style={{
                      padding: '9px 13px', fontSize: 14, lineHeight: 1.6,
                      background: mine ? '#211d17' : '#fff', color: mine ? '#f4eee0' : '#211d17',
                      border: '1px solid #211d17',
                    }}>
                      {renderWithBold(line.content)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
