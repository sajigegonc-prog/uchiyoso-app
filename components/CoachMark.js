'use client'
import { useState, useEffect } from 'react'

export default function CoachMark({ steps, onFinish }) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState(null)

  useEffect(() => {
    function update() {
      const step = steps[index]
      if (step?.targetId) {
        const el = document.getElementById(step.targetId)
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' })
          setRect(el.getBoundingClientRect())
          return
        }
      }
      setRect(null)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [index, steps])

  if (index >= steps.length) return null
  const step = steps[index]
  const isLast = index === steps.length - 1

  function handleNext() {
    if (isLast) {
      onFinish?.()
    }
    setIndex((i) => i + 1)
  }

  const pad = 8
  const highlightStyle = rect ? {
    position: 'fixed',
    top: rect.top - pad, left: rect.left - pad,
    width: rect.width + pad * 2, height: rect.height + pad * 2,
    border: '2px solid #f4eee0', borderRadius: 8,
    boxShadow: '0 0 0 2000px rgba(33,29,23,.78)',
    zIndex: 200, pointerEvents: 'none',
  } : {
    position: 'fixed', inset: 0, background: 'rgba(33,29,23,.78)', zIndex: 200,
  }

  const tooltipTop = rect
    ? Math.min(Math.max(rect.bottom + 16, 20), (typeof window !== 'undefined' ? window.innerHeight : 800) - 170)
    : null

  const tooltipStyle = rect ? {
    position: 'fixed', top: tooltipTop, left: 20, right: 20, zIndex: 201,
  } : {
    position: 'fixed', top: '50%', left: 20, right: 20, transform: 'translateY(-50%)', zIndex: 201,
  }

  return (
    <>
      <div style={highlightStyle} />
      <div style={tooltipStyle}>
        <div style={{ background: '#f4eee0', border: '1px solid #211d17', padding: 16, maxWidth: 360, margin: '0 auto' }}>
          <p style={{ fontSize: 13, color: '#211d17', lineHeight: 1.8 }}>{step.text}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <span style={{ fontSize: 10.5, color: '#8a8168' }}>{index + 1} / {steps.length}</span>
            <button
              type="button"
              onClick={handleNext}
              style={{ padding: '7px 18px', border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
            >
              {isLast ? 'わかった' : '次へ'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
