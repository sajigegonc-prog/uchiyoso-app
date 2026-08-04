import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { lightBackLinkStyle } from './styles'

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

  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh',
      padding: '28px 20px 100px', position: 'relative',
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
      <Link
        href="/ocs/new"
        style={{
          position: 'fixed', right: 20, bottom: 28,
          width: 56, height: 56, borderRadius: 10,
          background: '#8b5a2b', border: '2px solid #3d2717', boxShadow: '0 3px 0 #3d2717',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, color: '#f3e9d8', textDecoration: 'none', lineHeight: 1,
        }}
        aria-label="新しいOCを登録"
      >
        ＋
      </Link>
    </div>
  )
}
