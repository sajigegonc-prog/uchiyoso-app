import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { lightBackLinkStyle } from '../styles'
import { updateOC, deleteOC } from './actions'
import EditOCForm from './EditOCForm'
import IconUploader from './IconUploader'
import DeleteOCButton from './DeleteOCButton'
import Avatar from '@/components/Avatar'

export default async function OCDetailPage({ params }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const { id } = params
  const { data: oc } = await supabase
    .from('ocs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!oc) notFound()

  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh', padding: '28px 20px 60px' }}>
      <Link href="/ocs" style={lightBackLinkStyle}>← OC一覧に戻る</Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
        <Avatar name={oc.name} iconUrl={oc.icon_url} size={64} />
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#241a10' }}>{oc.name}</div>
          <div style={{ fontSize: 12, color: '#8b7355', marginTop: 2 }}>
            {oc.oc_type === 'dreamer' ? '夢主' : '創作キャラ'}{oc.house ? ` ・ ${oc.house}` : ''}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 14, color: '#5c3a21', fontWeight: 700, marginTop: 28 }}>アイコン画像</h2>
      <IconUploader ocId={oc.id} userId={user.id} />

      <h2 style={{ fontSize: 14, color: '#5c3a21', fontWeight: 700, marginTop: 28 }}>編集</h2>
      <EditOCForm oc={oc} action={updateOC} />

      <form action={deleteOC} style={{ marginTop: 28 }}>
        <input type="hidden" name="id" value={oc.id} />
        <DeleteOCButton />
      </form>
    </div>
  )
}
