'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OcInfoModal from '@/components/OcInfoModal'

export default function WelcomePartnerModal({ oc, roomId, ageDiffLabel }) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  if (!open || !oc) return null
  function close() {
    setOpen(false)
    router.replace(`/chat/${roomId}`)
  }
  return (
    <OcInfoModal onClose={close}>
      <div style={{ fontSize: 11, color: '#8a8168', marginBottom: 6 }}>お相手が決まりました</div>
      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{oc.name}</div>
      <div style={{ fontSize: 11, color: '#8a8168', marginTop: 4 }}>{oc.house || '寮情報なし'}</div>
      <div style={{ fontSize: 12.5, marginTop: 10 }}>{ageDiffLabel}</div>
    </OcInfoModal>
  )
}
