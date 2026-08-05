import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function PublicOCDetailPage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { token, ocId } = params

  const { data: oc } = await supabase
    .rpc('get_public_oc_detail', { _token: token, _oc_id: ocId })
    .single()

  if (!oc) notFound()

  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px 60px' }}>
      <Link href={`/friends/add/${token}`} style={{ fontSize: 11, color: '#6b6250', textDecoration: 'none' }}>← プロフィールに戻る</Link>

      <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17', marginTop: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 22, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{oc.name}</div>
        <div style={{ fontSize: 10.5, color: '#8a8168', marginTop: 6, fontStyle: 'italic' }}>
          {oc.oc_type === 'dreamer' ? '夢主' : '創作キャラ'}{oc.house ? ` ・ ${oc.house}` : ''}
        </div>
      </div>

      {oc.oc_type === 'dreamer' && oc.paired_character && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, color: '#6b6250', letterSpacing: '.05em' }}>お相手</div>
          <div style={{ fontSize: 13, color: '#211d17', marginTop: 4 }}>{oc.paired_character}</div>
        </div>
      )}

      {oc.birth_date && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, color: '#6b6250', letterSpacing: '.05em' }}>生年月日</div>
          <div style={{ fontSize: 13, color: '#211d17', marginTop: 4 }}>
            {new Date(oc.birth_date).getMonth() + 1}月{new Date(oc.birth_date).getDate()}日
          </div>
        </div>
      )}

      {oc.description && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, color: '#6b6250', letterSpacing: '.05em' }}>設定・紹介文</div>
          <div style={{ fontSize: 13, color: '#211d17', marginTop: 4, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{oc.description}</div>
        </div>
      )}
    </div>
  )
}
