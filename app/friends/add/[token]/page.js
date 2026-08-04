import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { sendFriendRequestByToken } from '../../actions'
import SubmitButton from '@/components/SubmitButton'
import { lightBtnStyle } from '../../../ocs/styles'
export default async function AddFriendPage({ params }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')
  const { token } = params
  const { data: owner } = await supabase
    .rpc('get_profile_by_invite_token', { _token: token })
    .single()
  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center',
    }}>
      {!owner ? (
        <p style={{ fontSize: 14, color: '#8b7355' }}>このリンクは無効です。</p>
      ) : owner.id === user.id ? (
        <p style={{ fontSize: 14, color: '#8b7355' }}>これはあなた自身の招待リンクです。</p>
      ) : (
        <>
          <h1 style={{ fontSize: 18, color: '#241a10', fontWeight: 700 }}>
            {owner.display_name || '名前未設定'} さんから招待されています
          </h1>
          <p style={{ fontSize: 13, color: '#8b7355', marginTop: 10 }}>
            フレンド申請を送りますか?相手が承認するとフレンドになります。
          </p>
          <form action={sendFriendRequestByToken} style={{ marginTop: 20, width: '100%', maxWidth: 300 }}>
            <input type="hidden" name="token" value={token} />
            <SubmitButton style={lightBtnStyle} pendingText="送信中…">フレンド申請を送る</SubmitButton>
          </form>
        </>
      )}
    </div>
  )
}
