import { getT } from '@/lib/i18n/server'

export default function InvitationRow({ invitation, action }) {
  const t = getT()
  return (
    <div style={{ border: '1px solid #211d17', padding: 12, marginBottom: 10, background: '#fff' }}>
      <div style={{ fontSize: 13, color: '#211d17', lineHeight: 1.7 }}>
        {t('{inviter}さん宅の{inviterOc}が、{inviteeOc}と話したがっています', {
          inviter: invitation.inviter_name || t('名前未設定'),
          inviterOc: invitation.inviter_oc_name || t('名前未設定'),
          inviteeOc: invitation.invitee_oc_name || t('あなたのOC'),
        })}
      </div>
      {(invitation.location || invitation.time_period || invitation.situation) && (
        <div style={{ background: '#f4eee0', border: '1px dashed #8a8168', padding: '8px 10px', marginTop: 8 }}>
          <div style={{ fontSize: 9.5, color: '#8a8168', letterSpacing: '.05em', marginBottom: 3 }}>{t('シチュエーションも一緒に申請が来ています')}</div>
          {(invitation.location || invitation.time_period) && (
            <div style={{ fontSize: 11, color: '#6b6250', fontStyle: 'italic' }}>
              {invitation.location}{invitation.location && invitation.time_period ? t('／') : ''}{invitation.time_period}
            </div>
          )}
          {invitation.situation && (
            <div style={{ fontSize: 12, color: '#211d17', lineHeight: 1.7, marginTop: 4 }}>{invitation.situation}</div>
          )}
        </div>
      )}
      {invitation.note && (
        <div style={{ background: '#f4eee0', border: '1px dashed #8a8168', padding: '8px 10px', marginTop: 8 }}>
          <div style={{ fontSize: 9.5, color: '#8a8168', letterSpacing: '.05em', marginBottom: 3 }}>{t('一言メモ')}</div>
          <div style={{ fontSize: 12, color: '#211d17', lineHeight: 1.7 }}>{invitation.note}</div>
        </div>
      )}
      <form action={action} style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <input type="hidden" name="invitation_id" value={invitation.invitation_id} />
        <input type="hidden" name="room_id" value={invitation.room_id} />
        <input type="hidden" name="oc_id" value={invitation.invitee_oc_id} />
        <button type="submit" name="decision" value="accepted"
          style={{ border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontSize: 12, fontWeight: 700, padding: '6px 14px', cursor: 'pointer' }}>
          {t('承認する')}
        </button>
        <button type="submit" name="decision" value="declined"
          style={{ border: '1px solid #8a8168', background: '#fff', color: '#6b6250', fontSize: 12, fontWeight: 700, padding: '6px 14px', cursor: 'pointer' }}>
          {t('断る')}
        </button>
      </form>
    </div>
  )
}
