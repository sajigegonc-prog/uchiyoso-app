'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function RealtimeRefresh({ tables = [], fallbackMs = 15000 }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const channelName = 'realtime-' + tables.join('-') + '-' + Math.random().toString(36).slice(2)
    const channel = supabase.channel(channelName)
    tables.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        router.refresh()
      })
    })
    channel.subscribe()

    const interval = setInterval(() => router.refresh(), fallbackMs)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [tables.join(','), fallbackMs, router])

  return null
}
