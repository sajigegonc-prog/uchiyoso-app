import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { addOC } from '../actions'
import NewOCFormWithIcon from './NewOCFormWithIcon'
import Link from 'next/link'

export default async function NewOCPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { count } = await supabase
    .from('ocs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh',
      padding: '24px 20px 110px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 24, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
          新しいOCを登録
        </div>
        <div style={{ fontSize: 9.5, color: '#8a8168', marginTop: 8, letterSpacing: '.1em' }}>
          登録数 {count ?? 0} / 10
        </div>
        <Link href="/ocs" style={{ display: 'block', marginTop: 24, textAlign: 'center', fontSize: 11.5, color: '#6b6250', textDecoration: 'none' }}>
        ← OC一覧に戻る
      </Link>
      </div>
      {(count ?? 0) >= 10 ? (
        <p style={{ fontSize: 13, color: '#8a8168', marginTop: 24, maxWidth: 360, textAlign: 'center', fontStyle: 'italic' }}>
          OCの登録は最大10人までです。新しく登録するには、OC一覧から既存のOCを整理してください。
        </p>
      ) : (
        <NewOCFormWithIcon action={addOC} userId={user.id} />
      )}
    </div>
  )
}
