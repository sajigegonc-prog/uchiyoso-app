import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabaseServer'
import { respondToFriendRequest } from './actions'
import Link from 'next/link'
import CopyLinkButton from './CopyLinkButton'
import MarkFriendsReadOnMount from './MarkFriendsReadOnMount'

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('invite_token')
    .eq('id', user.id)
    .single()

  const host = headers().get('host')
  const proto = host?.includes('localhost') ? 'http' : 'https'
  const profileUrl = `${proto}://${host}/friends/add/${profile?.invite_token}`

  const { data: incoming } = await supabase.rpc('list_incoming_friend_requests')
  const { data: friends } = await supabase.rpc('list_my_friends_with_token')

  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px 110px' }}>
      <MarkFriendsReadOnMount />
      <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 26, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>友達</div>
      </div>

      <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 20 }}>
        あなたのプロフィールリンク
      </div>
      <div style={{ fontSize: 11, color: '#211d17', background: '#fff', border: '1px solid #211d17', padding: 10, marginTop: 8, wordBreak: 'break-all', fontFamily: "'Courier New', monospace" }}>
        {profileUrl}
      </div>
      <p style={{ fontSize: 10.5, color: '#8a8168', marginTop: 6, fontStyle: 'italic' }}>
        このリンクをSNS等で共有できます。相手がここから申請を送り、あなたが承認すると友達になります。
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <Link
          href={`/friends/add/${profile?.invite_token}`}
          style={{
            flex: 1, textAlign: 'center', padding: 9, border: '1px solid #8a8168',
            color: '#6b6250', fontSize: 11.5, textDecoration: 'none',
          }}
        >
          プロフィールを見る
        </Link>
        <CopyLinkButton text={profileUrl} />
      </div>

      {incoming && incoming.length > 0 && (
        <>
          <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 26 }}>
            届いている申請
          </div>
          {incoming.map((req) => (
            <div key={req.friendship_id} style={{ padding: '12px 2px', borderBottom: '1px solid #211d17', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#211d17' }}>{req.requester_name || '名前未設定'}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <form action={respondToFriendRequest}>
                  <input type="hidden" name="friendship_id" value={req.friendship_id} />
                  <input type="hidden" name="decision" value="accepted" />
                  <button type="submit" style={{ border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontSize: 11.5, fontWeight: 700, padding: '5px 12px', cursor: 'pointer' }}>承認</button>
                </form>
                <form action={respondToFriendRequest}>
                  <input type="hidden" name="friendship_id" value={req.friendship_id} />
                  <input type="hidden" name="decision" value="declined" />
                  <button type="submit" style={{ border: '1px solid #8a8168', background: '#fff', color: '#6b6250', fontSize: 11.5, fontWeight: 700, padding: '5px 12px', cursor: 'pointer' }}>断る</button>
                </form>
              </div>
            </div>
          ))}
        </>
      )}

      <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 26 }}>
        友達 ({friends?.length ?? 0})
      </div>
      {(!friends || friends.length === 0) && (
        <p style={{ fontSize: 13, color: '#8a8168', marginTop: 12, fontStyle: 'italic' }}>まだ友達がいません。</p>
      )}
      {friends && friends.map((f) => (
        <Link
          key={f.id}
          href={`/friends/add/${f.invite_token}`}
          style={{ display: 'block', padding: '12px 2px', borderBottom: '1px solid #211d17', textDecoration: 'none' }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#211d17' }}>
            {f.emoji ? `${f.emoji} ` : ''}{f.display_name || '名前未設定'}
          </div>
          {f.bio && (
            <div style={{ fontSize: 11, color: '#8a8168', marginTop: 2, fontStyle: 'italic' }}>{f.bio}</div>
          )}
        </Link>
      ))}

      <Link href="/home" style={{ display: 'block', marginTop: 30, marginBottom: 10, padding: '10px 0', textAlign: 'center', fontSize: 11.5, color: '#6b6250', textDecoration: 'none' }}>
        ← ホームに戻る
      </Link>
    </div>
  )
}
