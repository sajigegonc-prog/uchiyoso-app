'use client'
import { useEffect, useRef } from 'react'
import { markRoomRead } from './markRoomReadAction'

export default function MarkRoomReadOnMount({ roomId, messageCount }) {
  const lastCount = useRef(null)
  useEffect(() => {
    if (lastCount.current === messageCount) return
    lastCount.current = messageCount
    markRoomRead(roomId)
  }, [roomId, messageCount])
  return null
}
