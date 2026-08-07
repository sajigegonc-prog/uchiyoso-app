import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import ReplayClient from './ReplayClient'
export default async function ReplayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: myOcs } = await supabase
    .from('ocs')
    .select('id, name, icon_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  const { data: friendOcs } = await supabase.rpc('list_friend_ocs')
  const allKnownOcs = [
    ...(myOcs || []),
    ...(friendOcs || []).map((f) => ({ id: f.oc_id, name: f.oc_name, icon_url: f.oc_icon_url })),
  ]
  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px 60px' }}>
      <Link href="/home" style={{ fontSize: 11, color: '#6b6250', textDecoration: 'none' }}>← ホームに戻る</Link>
      <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17', marginTop: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 22, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
          過去のおしゃべりを思い出す
        </div>
      </div>
      <p style={{ fontSize: 11, color: '#8a8168', marginTop: 12, fontStyle: 'italic', lineHeight: 1.8 }}>
        場面転換などで発行したテキストログを貼り付けると、チャット画面風に再現できます。
        ここでの内容は保存されません。ページを閉じると消えます。
      </p>
      <ReplayClient myOcs={myOcs || []} allKnownOcs={allKnownOcs} />
    </div>
  )
}
