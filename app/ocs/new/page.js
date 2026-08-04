import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { addOC } from '../actions'
import NewOCForm from './NewOCForm'
import { lightBackLinkStyle } from '../styles'
export default async function NewOCPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const { count } = await supabase
    .from('ocs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh',
      padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <Link href="/home" style={lightBackLinkStyle}>← ホームに戻る</Link>
        <h1 style={{ fontSize: 18, color: '#241a10', fontWeight: 700, marginTop: 14 }}>
          新しいOCを登録
        </h1>
        <p style={{ fontSize: 12.5, color: '#8b7355', marginTop: 4 }}>
          登録数: {count ?? 0} / 5
        </p>
      </div>
      {(count ?? 0) >= 5 ? (
        <p style={{ fontSize: 13, color: '#8b7355', marginTop: 24, maxWidth: 360, textAlign: 'center' }}>
          OCの登録は最大5人までです。新しく登録するには、OC一覧から既存のOCを整理してください。
        </p>
      ) : (
        <NewOCForm action={addOC} />
      )}
    </div>
  )
}
