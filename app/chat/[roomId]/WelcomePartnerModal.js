'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OcInfoModal from '@/components/OcInfoModal'

export default function WelcomePartnerModal({ oc }) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  if (!open || !oc) return null
  function close() {
    setOpen(false)
    router.replace(`/chat/${oc.roomId}`)
  }
  return (
    <OcInfoModal onClose={close}>
      <div style={{ fontSize: 11, color: '#8a8168', marginBottom: 6 }}>お相手が決まりました</div>
      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{oc.name}</div>
      <div style={{ fontSize: 11, color: '#8a8168', marginTop: 4 }}>{oc.oc_type === 'dreamer' ? '夢主' : '創作キャラ'}{oc.house ? ` ・ ${oc.house}` : ''}</div>
      {oc.description && <p style={{ fontSize: 12.5, marginTop: 12, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{oc.description}</p>}
    </OcInfoModal>
  )
}
