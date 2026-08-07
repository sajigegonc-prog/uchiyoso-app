'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

function isTyping() {
  const el = document.activeElement
  return !!el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')
}

export default function RealtimeRefresh({ tables = [], fallbackMs = 15000 }) {
  const router = useRouter()
  useEffect(() => {
    const supabase = createClient()
    const channelName = 'realtime-' + tables.join('-') + '-' + Math.random().toString(36).slice(2)
    const channel = supabase.channel(channelName)
    tables.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        if (isTyping()) return
        router.refresh()
      })
    })
    channel.subscribe()
    const interval = setInterval(() => {
      if (isTyping()) return
      router.refresh()
    }, fallbackMs)
    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [tables.join(','), fallbackMs, router])
  return null
}
