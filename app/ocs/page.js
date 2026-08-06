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

export default async function OCsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: ocs } = await supabase
    .from('ocs')
    .select('id, name, oc_type, house, icon_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const { data: myProfile } = await supabase.from('profiles').select('display_name, emoji, bio').eq('id', user.id).maybeSingle()

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
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 26, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
          OC一覧
        </div>
        <div style={{ fontSize: 9.5, color: '#8a8168', marginTop: 8, letterSpacing: '.1em' }}>
          登録数 {ocs?.length ?? 0} / 10
        </div>
      </div>

      {(!ocs || ocs.length === 0) && (
        <p style={{ fontSize: 13, color: '#8a8168', marginTop: 20, fontStyle: 'italic', textAlign: 'center' }}>
          まだOCが登録されていません。
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
                <div style={{ fontSize: 11.5, color: '#6b6250', marginTop: 3, fontStyle: 'italic' }}>
                  {oc.oc_type === 'dreamer' ? '夢主' : '創作キャラ'}{oc.house ? ` ・ ${oc.house}` : ''}
                </div>
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
          + 新しいOCを登録する
        </Link>
      )}

      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif', borderBottom: '3px double #211d17', paddingBottom: 8 }}>
          中の人設定
        </div>
        <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 10 }}>
        表示名
        </div>
        <DisplayNameForm action={updateDisplayNameLimited} currentName={myProfile?.display_name || ''} />
        <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 10 }}>
          絵文字・一言プロフィール
        </div>
        <ProfileMetaForm action={updateSelfProfile} emoji={myProfile?.emoji || ''} bio={myProfile?.bio || ''} />
        <DisplayNameForm action={updateDisplayNameLimited} currentName={myProfile?.display_name || ''} />
        <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 10 }}>
          マッチングを避けたいお相手
        </div>
        <form action={addAvoidedPartner} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            name="character_name"
            placeholder="キャラクター名を入力"
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
            pendingText="追加中…"
          >
            追加
          </SubmitButton>
        </form>
        {avoidedPartners && avoidedPartners.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {avoidedPartners.map((p) => (
              <AvoidedPartnerTag key={p.id} partner={p} />
            ))}
          </div>
        )}
        <p style={{ fontSize: 10.5, color: '#8a8168', marginTop: 10, fontStyle: 'italic' }}>各一配慮などにお使いください。（ランダムマッチングは近日公開予定です）</p>
      </div>

      <Link href="/home" style={{ ...lightBackLinkStyle, display: 'block', marginTop: 30, textAlign: 'center', fontSize: 11.5 }}>
        ← ホームに戻る
      </Link>
    </div>
  )
}
