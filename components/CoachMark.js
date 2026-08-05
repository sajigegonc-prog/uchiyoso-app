'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function CoachMark({ steps, onFinish }) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted || index >= steps.length) return null
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
    ? Math.min(Math.max(rect.bottom + 16, 20), window.innerHeight - 170)
    : null

  const centerX = window.innerWidth / 2
  const tooltipWidth = Math.min(360, window.innerWidth - 40)

  const tooltipStyle = rect ? {
    position: 'fixed', top: tooltipTop,
    left: centerX - tooltipWidth / 2, width: tooltipWidth, zIndex: 201,
  } : {
    position: 'fixed', top: '50%', left: centerX - tooltipWidth / 2,
    width: tooltipWidth, transform: 'translateY(-50%)', zIndex: 201,
  }

  return createPortal(
    <>
      <div style={highlightStyle} />
      <div style={tooltipStyle}>
        <div style={{ background: '#f4eee0', border: '1px solid #211d17', padding: 16 }}>
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
    </>,
    document.body
  )
}
