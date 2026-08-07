'use client'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

export default function OcInfoModal({ onClose, children }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(33,29,23,.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#f4eee0', border: '1px solid #211d17', padding: 20, maxWidth: 320, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
          {children}
        </div>
        <button type="button" onClick={onClose} style={{ display: 'block', width: '100%', marginTop: 16, padding: 9, border: '1px solid #211d17', background: '#fff', color: '#211d17', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>閉じる</button>
      </div>
    </div>,
    document.body
  )
}
