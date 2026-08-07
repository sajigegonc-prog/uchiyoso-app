'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabaseClient'

export default function useTypingChannel(channelName, myUserId) {
  const [typerNames, setTyperNames] = useState([])
  const channelRef = useRef(null)
  const timersRef = useRef({})
  const namesRef = useRef({})
  const lastSentRef = useRef(0)

  useEffect(() => {
    if (!channelName || !myUserId) return
    const supabase = createClient()
    const channel = supabase.channel(channelName)
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (!payload || payload.userId === myUserId) return
      namesRef.current[payload.userId] = payload.name || '名前未設定'
      setTyperNames(Object.values(namesRef.current))
      clearTimeout(timersRef.current[payload.userId])
      timersRef.current[payload.userId] = setTimeout(() => {
        delete namesRef.current[payload.userId]
        setTyperNames(Object.values(namesRef.current))
      }, 3000)
    })
    channel.subscribe()
    channelRef.current = channel
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout)
      supabase.removeChannel(channel)
    }
  }, [channelName, myUserId])

  const sendTyping = useCallback((name) => {
    const now = Date.now()
    if (now - lastSentRef.current < 1500) return
    lastSentRef.current = now
    channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { userId: myUserId, name } })
  }, [myUserId])

  return { typerNames, sendTyping }
}