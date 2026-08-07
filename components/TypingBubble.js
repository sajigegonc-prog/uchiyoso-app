'use client'
import useTypingChannel from '@/lib/useTypingChannel'
import TypingDots from './TypingDots'

export default function TypingBubble({ channelName, myUserId }) {
  const { typerNames } = useTypingChannel(channelName, myUserId)
  return <TypingDots names={typerNames} dark={false} />
}
