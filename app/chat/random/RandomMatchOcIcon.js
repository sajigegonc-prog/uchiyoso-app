'use client'
import { useState } from 'react'
import OcInfoModal from '@/components/OcInfoModal'

export default function RandomMatchOcIcon({ name, iconUrl, house, career, ageDiffLabel }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div onClick={() => setOpen(true)} style={{
        width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer',
        background: '#211d17', border: '1px solid #211d17',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#f4eee0', fontWeight: 700, fontFamily: 'Georgia, serif',
      }}>
        {iconUrl ? <img src={iconUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name.charAt(0)}
      </div>
      {open && (
        <OcInfoModal onClose={() => setOpen(false)}>
          <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{name}</div>
          <div style={{ fontSize: 11, color: '#8a8168', marginTop: 4 }}>{house || '寮情報なし'}</div>
          {career && (
            <div style={{ fontSize: 10, color: '#8a8168', marginTop: 2 }}>卒後└ {career}</div>
          )}
          <div style={{ fontSize: 12.5, marginTop: 10 }}>{ageDiffLabel}</div>
        </OcInfoModal>
      )}
    </>
  )
}
