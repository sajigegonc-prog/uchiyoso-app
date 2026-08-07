'use client'
import { useEffect } from 'react'

export default function AutoScrollBottom({ targetId }) {
  useEffect(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById(targetId)
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [targetId])
  return null
}
