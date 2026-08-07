'use client'
import { useEffect } from 'react'

export default function AutoScrollBottom({ anchorId }) {
  useEffect(() => {
    function scroll() {
      const el = document.getElementById(anchorId)
      if (el) el.scrollIntoView({ block: 'end' })
    }
    scroll()
    const t1 = setTimeout(scroll, 100)
    const t2 = setTimeout(scroll, 400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [anchorId])
  return null
}
