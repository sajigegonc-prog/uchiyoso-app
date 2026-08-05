'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PullToRefresh() {
  const router = useRouter()
  const startY = useRef(null)
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    function onTouchStart(e) {
      startY.current = window.scrollY === 0 ? e.touches[0].clientY : null
    }
    function onTouchMove(e) {
      if (startY.current === null || refreshing) return
      const diff = e.touches[0].clientY - startY.current
      if (diff > 60) setPulling(true)
    }
    function onTouchEnd() {
      if (pulling && !refreshing) {
        setRefreshing(true)
        router.refresh()
        setTimeout(() => setRefreshing(false), 800)
      }
      setPulling(false)
      startY.current = null
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [pulling, refreshing, router])

  return (
    <div style={{
      textAlign: 'center', fontSize: 10.5, color: '#8a8168', fontStyle: 'italic',
      height: pulling || refreshing ? 22 : 0, overflow: 'hidden', transition: 'height .2s',
      fontFamily: "'BIZ UDPGothic', sans-serif",
    }}>
      {refreshing ? '更新しています…' : '離すと更新'}
    </div>
  )
}
