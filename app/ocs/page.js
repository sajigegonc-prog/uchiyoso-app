import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { lightBackLinkStyle } from './styles'
import { addAvoidedPartner } from './actions'
import AvoidedPartnerTag from './AvoidedPartnerTag'
import SubmitButton from '@/components/SubmitButton'

export default async function OCsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')

  const { data: ocs } = await supabase
    .from('ocs')
    .select('id, name, oc_type, house')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const { data: avoidedPartners } = await supabase
    .from('avoided_partners')
    .select('id, character_name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh',
      padding: '28px 20px 100px',
    }}>
      <Link href="/home" style={lightBackLinkStyle}>← ホームに戻る</Link>
      <h1 style={{ fontSize: 18, color: '#241a10', fontWeight: 700, marginTop: 14 }}>
        あなたのOC ({ocs?.length ?? 0} / 5)
      </h1>
      {(!ocs || ocs.length === 0) && (
        <p style={{ fontSize: 13, color: '#8b7355', marginTop: 12 }}>まだOCが登録されていません。</p>
      )}
      {ocs && ocs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {ocs.map((oc) => (
            <div
              key={oc.id}
              style={{
                background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3,
                padding: 14, boxShadow: '3px 3px 0 rgba(61,39,23,.15)',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#241a10' }}>{oc.name}</div>
              <div style={{ fontSize: 12, color: '#8b7355', marginTop: 2 }}>
                {oc.oc_type === 'dreamer' ? '夢主' : '創作キャラ'}{oc.house ? ` ・ ${oc.house}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {(ocs?.length ?? 0) < 5 && (
        <Link
          href="/ocs/new"
          style={{
            display: 'block', textAlign: 'center', marginTop: 14,
            border: '2px dashed #b3966a', borderRadius: 3, padding: 14,
            color: '#8b5a2b', fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}
        >
          ＋ 新しいOCを登録する
        </Link>
      )}

      <h2 style={{ fontSize: 15, color: '#241a10', fontWeight: 700, marginTop: 32 }}>中の人設定</h2>
      <p style={{ fontSize: 12.5, color: '#8b7355', marginTop: 4 }}>マッチングを避けたいお相手</p>
      <form action={addAvoidedPartner} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          name="character_name"
          placeholder="キャラクター名を入力"
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 3, fontSize: 14,
            background: '#fff', border: '2px solid #d8c7ac', color: '#241a10',
          }}
        />
        <SubmitButton
          style={{
            flexShrink: 0, padding: '10px 16px', borderRadius: 3, border: 'none',
            background: '#8b5a2b', color: '#f3e9d8', fontWeight: 700, fontSize: 13, cursor: 'pointer',
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
      <p style={{ fontSize: 11, color: '#8b7355', marginTop: 10 }}>各一配慮用です。</p>
    </div>
  )
}
