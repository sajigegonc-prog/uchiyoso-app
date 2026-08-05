'use client'
import { useEffect, useRef } from 'react'
import { markRoomRead } from './markRoomReadAction'

export default function MarkRoomReadOnMount({ roomId }) {
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    markRoomRead(roomId)
  }, [roomId])
  return null
}
