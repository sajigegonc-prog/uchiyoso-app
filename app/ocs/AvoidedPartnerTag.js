'use client'
import { removeAvoidedPartner } from './actions'

export default function AvoidedPartnerTag({ partner }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: '#fff', border: '1px solid #211d17',
      padding: '5px 6px 5px 12px', fontSize: 12, color: '#211d17',
    }}>
      {partner.character_name}
      <form action={removeAvoidedPartner}>
        <input type="hidden" name="id" value={partner.id} />
        <button
          type="submit"
          style={{
            border: 'none', background: 'none', cursor: 'pointer',
            color: '#6b6250', fontSize: 14, lineHeight: 1, padding: 0,
          }}
          aria-label="削除"
        >
          ×
        </button>
      </form>
    </span>
  )
}
