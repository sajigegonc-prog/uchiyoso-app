import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { lightBackLinkStyle } from './styles'
import { addAvoidedPartner } from './actions'
import AvoidedPartnerTag from './AvoidedPartnerTag'
import SubmitButton from '@/components/SubmitButton'
import Image from 'next/image'
import { updateSelfProfile } from './actions'
import ProfileMetaForm from './ProfileMetaForm'
import DisplayNameForm from './DisplayNameForm'
import { updateDisplayNameLimited } from '../settings/actions'
import DreamPartnerSection from './DreamPartnerSection'
import { saveDreamPartner, deleteDreamPartner } from './dreamPartnerActions'
import { getT } from '@/lib/i18n/server'
import { setStrangerMatchEnabled, unblockUser } from './strangerSettingsActions'

export default async function OCsPage() {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

    const { data: ocs } = await supabase
    .from('ocs')
    .select('id, name, oc_type, house, career, era_focus, icon_url')
    .eq('user_id', user.id)
    .eq('is_dream_partner', false)
    .order('created_at', { ascending: true })

    const { data: dreamPartners } = await supabase
    .from('ocs')
    .select('id, name, icon_url, paired_with_oc_id')
    .eq('user_id', user.id)
    .eq('is_dream_partner', true)
    .order('created_at', { ascending: true })

    const { data: dreamerOcs } = await supabase
    .from('ocs')
    .select('id, name')
    .eq('user_id', user.id)
    .eq('is_dream_partner', false)
    .eq('oc_type', 'dreamer')
    .order('created_at', { ascending: true })

  const { data: myProfile } = await supabase.from('profiles').select('display_name, emoji, bio').eq('id', user.id).maybeSingle()

  const { data: strangerProfile } = await supabase.from('profiles').select('stranger_match_enabled').eq('id', user.id).maybeSingle()
  const strangerEnabled = strangerProfile?.stranger_match_enabled !== false
  const { data: blocks } = await supabase
    .from('user_blocks')
    .select('id, blocked_label, created_at')
    .eq('blocker_id', user.id)
    .order('created_at', { ascending: true })

  const { data: avoidedPartners } = await supabase
    .from('avoided_partners')
    .select('id, character_name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh',
      padding: '24px 20px 100px',
    }}>
      <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO CLUB</div>
        <div style={{ fontSize: 26, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
          {t('OC一覧')}
        </div>
        <div style={{ fontSize: 9.5, color: '#8a8168', marginTop: 8, letterSpacing: '.1em' }}>
          {t('登録数 {count} / 10', { count: ocs?.length ?? 0 })}
        </div>
      </div>

      {(!ocs || ocs.length === 0) && (
        <p style={{ fontSize: 13, color: '#8a8168', marginTop: 20, fontStyle: 'italic', textAlign: 'center' }}>
          {t('まだOCが登録されていません。')}
        </p>
      )}
      {ocs && ocs.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {ocs.map((oc) => (
            <Link
              key={oc.id}
              href={`/ocs/${oc.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 2px', borderBottom: '1px solid #211d17',
                textDecoration: 'none',
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                background: '#211d17', border: '1px solid #211d17',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#f4eee0', fontWeight: 700, fontSize: 16, fontFamily: 'Georgia, serif',
                position: 'relative',
              }}>
                {oc.icon_url ? (
                  <Image src={oc.icon_url} alt={oc.name} fill sizes="46px" style={{ objectFit: 'cover' }} />
                ) : oc.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif' }}>
                  {oc.name}
                </div>
                {oc.era_focus === 'career' ? (
                  <>
                    <div style={{ fontSize: 11.5, color: '#6b6250', marginTop: 3, fontStyle: 'italic' }}>
                      {oc.oc_type === 'dreamer' ? t('夢主') : t('創作キャラ')}{oc.career ? ` ・ ${oc.career}` : ''}
                    </div>
                    {oc.house && (
                      <div style={{ fontSize: 10, color: '#8a8168', marginTop: 2 }}>{t('在学時└ {house}卒', { house: t(oc.house) })}</div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 11.5, color: '#6b6250', marginTop: 3, fontStyle: 'italic' }}>
                      {oc.oc_type === 'dreamer' ? t('夢主') : t('創作キャラ')}{oc.house ? ` ・ ${t(oc.house)}` : ''}
                    </div>
                    {oc.career && (
                      <div style={{ fontSize: 10, color: '#8a8168', marginTop: 2 }}>{t('卒後└ {career}', { career: oc.career })}</div>
                    )}
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {(ocs?.length ?? 0) < 10 && (
        <Link
          href="/ocs/new"
          style={{
            display: 'block', textAlign: 'center', marginTop: 20,
            border: '1px dashed #6b6250', padding: 14,
            color: '#3d2717', fontWeight: 700, fontSize: 13, textDecoration: 'none',
            letterSpacing: '.05em',
          }}
        >
          {t('+ 新しいOCを登録する')}
        </Link>
      )}

      <DreamPartnerSection
        dreamPartners={dreamPartners || []}
        dreamerOcs={dreamerOcs || []}
        userId={user.id}
        saveAction={saveDreamPartner}
        deleteAction={deleteDreamPartner}
      />

      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif', borderBottom: '3px double #211d17', paddingBottom: 8 }}>
          {t('中の人設定')}
        </div>
        <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 10 }}>
        {t('表示名')}
        </div>
        <DisplayNameForm action={updateDisplayNameLimited} currentName={myProfile?.display_name || ''} />
        <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 10 }}>
          {t('絵文字・一言プロフィール')}
        </div>
        <ProfileMetaForm action={updateSelfProfile} emoji={myProfile?.emoji || ''} bio={myProfile?.bio || ''} />
        <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 10 }}>
          {t('マッチングを避けたいお相手')}
        </div>
        <form action={addAvoidedPartner} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            name="character_name"
            placeholder={t('キャラクター名を入力')}
            style={{
              flex: 1, padding: '10px 12px', fontSize: 14,
              background: '#fff', border: '1px solid #211d17', color: '#211d17',
            }}
          />
          <SubmitButton
            style={{
              flexShrink: 0, padding: '10px 16px', border: '1px solid #211d17',
              background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
            pendingText={t('追加中…')}
          >
            {t('追加')}
          </SubmitButton>
        </form>
        {avoidedPartners && avoidedPartners.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {avoidedPartners.map((p) => (
              <AvoidedPartnerTag key={p.id} partner={p} />
            ))}
          </div>
        )}
        <p style={{ fontSize: 10.5, color: '#8a8168', marginTop: 10, fontStyle: 'italic' }}>{t('各種配慮などにお使いください。ここに登録した名前が、相手の「お相手」設定と重なるアカウントとは、知らない人とのランダムマッチで出会いません。')}</p>

        <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 22 }}>
          {t('知らない人とのマッチング設定')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10 }}>
          <span style={{ fontSize: 13, color: '#211d17', fontWeight: 700 }}>
            {strangerEnabled ? t('現在：ON') : t('現在：OFF')}
          </span>
          <form action={setStrangerMatchEnabled}>
            <input type="hidden" name="enabled" value={strangerEnabled ? '0' : '1'} />
            <SubmitButton
              style={{
                padding: '8px 16px', border: '1px solid #211d17',
                background: strangerEnabled ? '#fff' : '#211d17', color: strangerEnabled ? '#211d17' : '#f4eee0',
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}
              pendingText="…"
            >
              {strangerEnabled ? t('OFFにする') : t('ONにする')}
            </SubmitButton>
          </form>
        </div>
        <p style={{ fontSize: 10.5, color: '#8a8168', marginTop: 8, lineHeight: 1.7 }}>
          {t('ONの間、友達以外の人とランダムマッチできます。相手にはOCの名前と情報だけが見え、友達になるまで中の人の名前や発言はできません。OFFにすると、あなたのOCは他の人のランダムマッチに出てこなくなります（自分も使えなくなります）。')}
        </p>
        {blocks && blocks.length > 0 && (
          <>
            <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', marginTop: 14 }}>{t('ブロック中の相手')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {blocks.map((b) => (
                <span key={b.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #211d17', padding: '5px 6px 5px 12px', fontSize: 12, color: '#211d17' }}>
                  {b.blocked_label || t('名前未設定')}
                  <form action={unblockUser}>
                    <input type="hidden" name="id" value={b.id} />
                    <button type="submit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8a2418', fontSize: 11, padding: 0, textDecoration: 'underline' }}>{t('解除')}</button>
                  </form>
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <Link href="/home" style={{ ...lightBackLinkStyle, display: 'block', marginTop: 30, textAlign: 'center', fontSize: 11.5 }}>
        {t('← ホームに戻る')}
      </Link>
    </div>
  )
}
