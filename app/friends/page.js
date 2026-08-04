import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabaseServer'
import { respondToFriendRequest } from './actions'
import SubmitButton from '@/components/SubmitButton'
import { lightBtnStyle, lightBackLinkStyle } from '../ocs/styles'
import Link from 'next/link'

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('invite_token')
    .eq('id', user.id)
    .single()

  const host = headers().get('host')
  const proto = host?.includes('localhost') ? 'http' : 'https'
  const inviteUrl = `${proto}://${host}/friends/add/${profile?.invite_token}`

  const { data: incoming } = await supabase.rpc('list_incoming_friend_requests')
  const { data: outgoing } = await supabase.rpc('list_outgoing_friend_requests')
  const { data: friends } = await supabase.rpc('list_my_friends')

  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh', padding: '28px 20px 40px' }}>
      <Link href="/home" style={lightBackLinkStyle}>← ホームに戻る</Link>
      <h1 style={{ fontSize: 18, color: '#241a10', fontWeight: 700, marginTop: 14 }}>フレンド</h1>

      <div style={{ marginTop: 20, background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3, padding: 14 }}>
        <div style={{ fontSize: 12.5, color: '#5c3a21', fontWeight: 700, marginBottom: 6 }}>あなたの招待リンク</div>
        <div style={{ fontSize: 11.5, color: '#241a10', wordBreak: 'break-all', background: '#fff', border: '1px solid #d8c7ac', borderRadius: 3, padding: 8 }}>
          {inviteUrl}
        </div>
        <p style={{ fontSize: 11, color: '#8b7355', marginTop: 6 }}>
          このリンクを送った相手が開いて申請すると、あなたの承認でフレンドになれます。
        </p>
      </div>

      {incoming && incoming.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, color: '#5c3a21', fontWeight: 700, marginTop: 24 }}>届いている申請</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {incoming.map((req) => (
              <div key={req.friendship_id} style={{ background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3, padding: 12 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#241a10' }}>{req.requester_name || '名前未設定'}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <form action={respondToFriendRequest}>
                    <input type="hidden" name="friendship_id" value={req.friendship_id} />
                    <input type="hidden" name="decision" value="accepted" />
                    <SubmitButton style={{ ...lightBtnStyle, marginTop: 0, padding: '8px 14px', fontSize: 12.5 }} pendingText="処理中…">承認する</SubmitButton>
                  </form>
                  <form action={respondToFriendRequest}>
                    <input type="hidden" name="friendship_id" value={req.friendship_id} />
                    <input type="hidden" name="decision" value="declined" />
                    <SubmitButton
                      style={{ ...lightBtnStyle, marginTop: 0, padding: '8px 14px', fontSize: 12.5, background: '#fff', color: '#8b7355', boxShadow: 'none', border: '2px solid #d8c7ac' }}
                      pendingText="処理中…"
                    >
                      断る
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {outgoing && outgoing.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, color: '#5c3a21', fontWeight: 700, marginTop: 24 }}>申請中</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {outgoing.map((req) => (
              <div key={req.friendship_id} style={{ fontSize: 13, color: '#8b7355' }}>
                {req.addressee_name || '名前未設定'} さんへの申請、承認待ちです
              </div>
            ))}
          </div>
        </>
      )}

      <h2 style={{ fontSize: 14, color: '#5c3a21', fontWeight: 700, marginTop: 24 }}>フレンド ({friends?.length ?? 0})</h2>
      {(!friends || friends.length === 0) && (
        <p style={{ fontSize: 13, color: '#8b7355', marginTop: 8 }}>まだフレンドがいません。</p>
      )}
      {friends && friends.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {friends.map((f) => (
            <div key={f.id} style={{ background: '#fbf5e9', border: '2px solid #8b6a4a', borderRadius: 3, padding: 12, fontSize: 13.5, fontWeight: 700, color: '#241a10' }}>
              {f.display_name || '名前未設定'}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
