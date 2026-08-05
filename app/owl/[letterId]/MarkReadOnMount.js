'use client'
import { useEffect, useRef } from 'react'
import { markLetterRead } from '../actions'

export default function MarkReadOnMount({ letterId, alreadyDone }) {
  const done = useRef(false)
  useEffect(() => {
    if (alreadyDone || done.current) return
    done.current = true
    const formData = new FormData()
    formData.set('letter_id', letterId)
    markLetterRead(formData)
  }, [letterId, alreadyDone])
  return null
}
