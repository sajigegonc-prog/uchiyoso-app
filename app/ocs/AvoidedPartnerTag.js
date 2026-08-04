'use client'
import { removeAvoidedPartner } from './actions'

export default function AvoidedPartnerTag({ partner }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: '#f3e9d8', border: '1px solid #d8c7ac', borderRadius: 20,
      padding: '6px 10px 6px 14px', fontSize: 12.5, color: '#5c3a21',
    }}>
      {partner.character_name}
      <form action={removeAvoidedPartner}>
        <input type="hidden" name="id" value={partner.id} />
        <button
          type="submit"
          style={{
            border: 'none', background: 'none', cursor: 'pointer',
            color: '#8b7355', fontSize: 14, lineHeight: 1, padding: 0,
          }}
          aria-label="削除"
        >
          ×
        </button>
      </form>
    </span>
  )
}
