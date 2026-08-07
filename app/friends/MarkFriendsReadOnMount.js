'use client'
import { useEffect } from 'react'
import { markFriendNotificationsSeen } from './actions'

export default function MarkFriendsReadOnMount() {
  useEffect(() => {
    markFriendNotificationsSeen()
  }, [])
  return null
}