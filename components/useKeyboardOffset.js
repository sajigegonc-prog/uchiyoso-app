'use client'
import { useEffect, useState } from 'react'

export default function useKeyboardOffset() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    function handleResize() {
      const kb = window.innerHeight - vv.height - vv.offsetTop
      setOffset(kb > 0 ? kb : 0)
    }

    vv.addEventListener('resize', handleResize)
    vv.addEventListener('scroll', handleResize)
    handleResize()

    return () => {
      vv.removeEventListener('resize', handleResize)
      vv.removeEventListener('scroll', handleResize)
    }
  }, [])

  return offset
}
