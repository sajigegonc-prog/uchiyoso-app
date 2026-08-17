'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

function isTyping() {
  const el = document.activeElement
  return !!el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')
}

function isRefreshSuppressed() {
  return document.body?.dataset.suppressRefresh === 'true'
}


export default function RealtimeRefresh({ tables = [], fallbackMs = 15000 }) {
  const router = useRouter()
  const debounceRef = useRef(null)

  useEffect(() => {
        function scheduleRefresh() {
      if (isTyping()) return
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(function attempt() {
        if (isTyping()) return
        if (isRefreshSuppressed()) {
          debounceRef.current = setTimeout(attempt, 600)
          return
        }
        router.refresh()
      }, 600)
    }

    const supabase = createClient()
    const channelName = 'realtime-' + tables.join('-') + '-' + Math.random().toString(36).slice(2)
    const channel = supabase.channel(channelName)
    tables.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, scheduleRefresh)
    })
    channel.subscribe()
    const interval = setInterval(scheduleRefresh, fallbackMs)
    return () => {
      clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [tables.join(','), fallbackMs, router])
  return null
}
