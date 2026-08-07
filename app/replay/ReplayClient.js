'use client'
import { useState, useRef, useEffect } from 'react'

const LINES_PER_IMAGE = 7

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

function chunkLines(parsed) {
  const chunks = []
  for (let i = 0; i < parsed.length; i += LINES_PER_IMAGE) {
    chunks.push(parsed.slice(i, i + LINES_PER_IMAGE))
  }
  return chunks.length > 0 ? chunks : [[]]
}

function ChatLine({ line, oc, showName }) {
  const mine = line.isMine
  if (line.isSystem) {
    return (
      <div style={{ textAlign: 'center', fontSize: 11, color: '#8a8168', fontStyle: 'italic' }}>
        — {line.content} —
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: mine ? 'row-reverse' : 'row' }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        background: '#211d17', border: '1px solid #211d17',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#f4eee0', fontWeight: 700, fontSize: 12, fontFamily: 'Georgia, serif',
      }}>
        {oc?.icon_url ? (
          <img src={oc.icon_url} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (line.speaker || '?').charAt(0)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
        {showName && (
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
}

export default function ReplayClient({ myOcs, allKnownOcs }) {
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [activePage, setActivePage] = useState(0)
  const [generatedImages, setGeneratedImages] = useState({})
  const [generating, setGenerating] = useState(false)
  const captureRefs = useRef([])

  function ocFor(speakerName) {
    return (allKnownOcs || myOcs).find((oc) => oc.name === speakerName)
  }

  function handleParse() {
    setParsed(parseTranscript(raw))
  }

  function handleReset() {
    setParsed(null)
    setRaw('')
    setGeneratedImages({})
  }

  const chunks = parsed ? chunkLines(parsed) : []

  async function generateImage(pageIndex) {
    if (generatedImages[pageIndex] || typeof window === 'undefined' || !window.html2canvas) return
    const node = captureRefs.current[pageIndex]
    if (!node) return
    setGenerating(true)
    try {
      const canvas = await window.html2canvas(node, { backgroundColor: '#eee1cb', scale: 2 })
      const dataUrl = canvas.toDataURL('image/png')
      setGeneratedImages((prev) => ({ ...prev, [pageIndex]: dataUrl }))
    } catch (e) {
      console.error('画像生成エラー:', e)
    } finally {
      setGenerating(false)
    }
  }

  async function openImageModal() {
    setImageModalOpen(true)
    setActivePage(0)
    await generateImage(0)
  }

  useEffect(() => {
    if (imageModalOpen) generateImage(activePage)
  }, [activePage, imageModalOpen])

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
              const prevLine = parsed[i - 1]
              const showName = !prevLine || prevLine.isSystem || prevLine.speaker !== line.speaker
              return <ChatLine key={i} line={line} oc={ocFor(line.speaker)} showName={showName} />
            })}
          </div>

          {parsed.length > 0 && (
            <button
              type="button"
              onClick={openImageModal}
              style={{
                display: 'block', width: '100%', marginTop: 14, padding: 13,
                border: '1px solid #211d17', background: '#211d17', color: '#f4eee0',
                fontWeight: 700, fontSize: 14, letterSpacing: '.05em', cursor: 'pointer',
              }}
            >
              画像として保存
            </button>
          )}

          {/* 画像生成用の見えない描画エリア(モーダルの外、画面には出さない) */}
          <div style={{ position: 'fixed', top: -9999, left: -9999, pointerEvents: 'none' }}>
            {chunks.map((chunk, pageIndex) => (
              <div
                key={pageIndex}
                ref={(el) => { captureRefs.current[pageIndex] = el }}
                style={{ width: 360, background: '#eee1cb', padding: '18px 14px 22px', fontFamily: "'BIZ UDPGothic', sans-serif" }}
              >
                <div style={{ textAlign: 'center', fontSize: 10, letterSpacing: '.3em', color: '#8a8168', marginBottom: 14 }}>THE UCHIYOSO CLUB</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {chunk.map((line, i) => {
                    const globalIndex = pageIndex * LINES_PER_IMAGE + i
                    const prevLine = parsed[globalIndex - 1]
                    const showName = !prevLine || prevLine.isSystem || prevLine.speaker !== line.speaker
                    return <ChatLine key={i} line={line} oc={ocFor(line.speaker)} showName={showName} />
                  })}
                </div>
                <div style={{ textAlign: 'center', fontSize: 9, color: '#a89b7a', marginTop: 10, letterSpacing: '.1em' }}>
                  {pageIndex + 1} / {chunks.length}
                </div>
              </div>
            ))}
          </div>

          {imageModalOpen && (
            <div
              onClick={() => setImageModalOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(33,29,23,.85)', zIndex: 200, display: 'flex', flexDirection: 'column', padding: '18px 14px', overflowY: 'auto' }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ color: '#f4eee0', fontSize: 12, letterSpacing: '.1em' }}>画像プレビュー（全{chunks.length}枚）</span>
                  <button type="button" onClick={() => setImageModalOpen(false)} style={{ background: 'none', border: 'none', color: '#cbb98a', fontSize: 18, cursor: 'pointer' }}>×</button>
                </div>
                {chunks.length > 1 && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    {chunks.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActivePage(i)}
                        style={{
                          padding: '4px 10px', fontSize: 10.5, cursor: 'pointer',
                          border: `1px solid ${activePage === i ? '#f4eee0' : '#6b6250'}`,
                          background: activePage === i ? '#f4eee0' : 'transparent',
                          color: activePage === i ? '#211d17' : '#cbb98a',
                        }}
                      >
                        {i + 1}枚目
                      </button>
                    ))}
                  </div>
                )}
                {generatedImages[activePage] ? (
                  <img src={generatedImages[activePage]} alt={`${activePage + 1}枚目`} style={{ width: '100%', border: '1px solid #211d17' }} />
                ) : (
                  <p style={{ color: '#cbb98a', fontSize: 12, textAlign: 'center', padding: 30 }}>{generating ? '生成中…' : '準備しています…'}</p>
                )}
                <p style={{ textAlign: 'center', fontSize: 10, color: '#cbb98a', marginTop: 14, lineHeight: 1.8 }}>
                  画像を<b style={{ color: '#f4eee0' }}>長押し</b>して「写真に保存」を選んでください<br />
                  （自動保存は行われません）
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
