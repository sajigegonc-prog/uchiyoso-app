import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { updateOC, deleteOC } from './actions'
import EditOCForm from './EditOCForm'
import IconUploader from './IconUploader'
import DeleteOCButton from './DeleteOCButton'
import Image from 'next/image'

export default async function OCDetailPage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px 110px' }}>
      <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 24, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
          {oc.name}
        </div>
        <div style={{ fontSize: 10.5, color: '#8a8168', marginTop: 8, fontStyle: 'italic' }}>
          {oc.oc_type === 'dreamer' ? '夢主' : '創作キャラ'}{oc.house ? ` ・ ${oc.house}` : ''}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <div style={{
          width: 76, height: 76, borderRadius: '50%', overflow: 'hidden',
          background: '#211d17', border: '1px solid #211d17',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#f4eee0', fontWeight: 700, fontSize: 24, fontFamily: 'Georgia, serif',
          position: 'relative',
        }}>
          {oc.icon_url ? (
            <Image src={oc.icon_url} alt={oc.name} fill sizes="76px" style={{ objectFit: 'cover' }} />
          ) : oc.name?.charAt(0)}
        </div>
      </div>

      <div style={{ fontSize: 11, letterSpacing: '.15em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 28 }}>
        アイコン画像
      </div>
      <IconUploader ocId={oc.id} userId={user.id} />

      <div style={{ fontSize: 11, letterSpacing: '.15em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 28 }}>
        編集
      </div>
      <EditOCForm oc={oc} action={updateOC} />

      <form action={deleteOC} style={{ marginTop: 28 }}>
        <input type="hidden" name="id" value={oc.id} />
        <DeleteOCButton />
      </form>

      <Link href="/ocs" style={{ display: 'block', marginTop: 30, marginBottom: 10, padding: '10px 0', textAlign: 'center', fontSize: 11.5, color: '#6b6250', textDecoration: 'none' }}>
        ← OC一覧に戻る
      </Link>
    </div>
  )
}
