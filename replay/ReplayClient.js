'use client'
import { useState, useMemo } from 'react'

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

export default function ReplayClient({ myOcs }) {
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState(null)
  const [mineSpeaker, setMineSpeaker] = useState('')

  const speakers = useMemo(() => {
    if (!parsed) return []
    const set = new Set()
    for (const line of parsed) {
      if (!line.isSystem) set.add(line.speaker)
    }
    return Array.from(set)
  }, [parsed])

  function ocFor(speakerName) {
    return myOcs.find((oc) => oc.name === speakerName)
  }

  function handleParse() {
    const result = parseTranscript(raw)
    setParsed(result)
    const hasMarked = result.some((l) => !l.isSystem && l.isMine)
    if (!hasMarked) {
      const firstSpeaker = result.find((l) => !l.isSystem)?.speaker
      setMineSpeaker(firstSpeaker || '')
    } else {
      setMineSpeaker('')
    }
  }

  function handleReset() {
    setParsed(null)
    setRaw('')
    setMineSpeaker('')
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <label style={{ fontSize: 11, color: '#6b6250', letterSpacing: '.05em' }}>あなたの発言(右側に表示)</label>
            <select
              value={mineSpeaker}
              onChange={(e) => setMineSpeaker(e.target.value)}
              style={{ padding: '6px 10px', fontSize: 12.5, border: '1px solid #211d17', background: '#fff', color: '#211d17' }}
            >
              <option value="">指定しない</option>
              {speakers.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleReset}
              style={{ marginLeft: 'auto', fontSize: 11, color: '#6b6250', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
            >
              クリアして貼り直す
            </button>
          </div>
          <p style={{ fontSize: 10, color: '#8a8168', marginTop: 4, marginBottom: 12, fontStyle: 'italic' }}>
            ★の付いた発言は、あなたのキャラとして自動で右側に表示されます。
          </p>

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
              const mine = line.isMine || (mineSpeaker && line.speaker === mineSpeaker)
              const oc = ocFor(line.speaker)
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
                    {!mine && (
                      <div style={{ fontSize: 10.5, color: '#6b6250', marginBottom: 3, fontStyle: 'italic' }}>{line.speaker}</div>
                    )}
                    <div style={{
                      padding: '9px 13px', fontSize: 14, lineHeight: 1.6,
                      background: mine ? '#211d17' : '#fff', color: mine ? '#f4eee0' : '#211d17',
                      border: '1px solid #211d17',
                    }}>
                      {line.content}
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
