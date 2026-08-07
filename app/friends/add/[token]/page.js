import { createClient } from '@/lib/supabaseServer'
import { sendFriendRequestByToken, unfriendUser } from '../../actions'
import Link from 'next/link'

export default async function ProfilePage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { token } = params
  const { data: owner } = await supabase
    .rpc('get_profile_by_invite_token', { _token: token })
    .single()

  if (!owner) {
    return (
      <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#8a8168', fontStyle: 'italic' }}>このリンクは無効です。</p>
      </div>
    )
  }

  const isSelf = user && owner.id === user.id
  const { data: ocs } = await supabase.rpc('get_public_ocs_by_token', { _token: token })

  let friendshipStatus = null
  if (user && !isSelf) {
    const { data: existing } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${owner.id}),and(requester_id.eq.${owner.id},addressee_id.eq.${user.id})`)
      .maybeSingle()
    friendshipStatus = existing?.status || null
  }

  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px 60px' }}>
      <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 22, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>プロフィール</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <div style={{
          width: 68, height: 68, borderRadius: '50%',
          background: '#211d17', color: '#f4eee0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 22, fontFamily: 'Georgia, serif',
        }}>
          {(owner.display_name || '?').charAt(0)}
        </div>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', marginTop: 10, fontFamily: 'Georgia, serif', color: '#211d17' }}>
        {owner.emoji ? `${owner.emoji} ` : ''}{owner.display_name || '名前未設定'}
      </div>
      {owner.bio ? (
        <div style={{ fontSize: 12, color: '#6b6250', textAlign: 'center', marginTop: 6, fontStyle: 'italic', lineHeight: 1.6 }}>{owner.bio}</div>
      ) : (
        <div style={{ fontSize: 10.5, color: '#8a8168', textAlign: 'center', marginTop: 4, fontStyle: 'italic' }}>うちよそユーザー</div>
      )}

      <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 26 }}>
        登録OC
      </div>
      {(!ocs || ocs.length === 0) && (
        <p style={{ fontSize: 12.5, color: '#8a8168', marginTop: 12, fontStyle: 'italic' }}>まだOCが登録されていません。</p>
      )}
      {ocs && ocs.map((oc) => (
        <Link
          key={oc.id}
          href={`/friends/add/${token}/oc/${oc.id}`}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 2px', borderBottom: '1px solid #211d17', textDecoration: 'none' }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: '#211d17', border: '1px solid #211d17',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#f4eee0', fontWeight: 700, fontSize: 14, fontFamily: 'Georgia, serif',
          }}>
            {oc.icon_url ? (
              <img src={oc.icon_url} alt={oc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : oc.name?.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#211d17' }}>{oc.name}</div>
            <div style={{ fontSize: 10.5, color: '#6b6250', marginTop: 2, fontStyle: 'italic' }}>
              {oc.oc_type === 'dreamer' ? '夢主' : '創作キャラ'}{oc.house ? ` ・ ${oc.house}` : ''}
            </div>
          </div>
        </Link>
      ))}

      {!user && (
        <Link
          href="/"
          style={{ display: 'block', marginTop: 24, textAlign: 'center', padding: 13, border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 14, letterSpacing: '.05em', textDecoration: 'none' }}
        >
          ログインしてフレンド申請を送る
        </Link>
      )}

      {user && !isSelf && friendshipStatus === 'accepted' && (
        <form action={unfriendUser} style={{ marginTop: 24 }}>
          <input type="hidden" name="other_id" value={owner.id} />
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            style={{ display: 'block', width: '100%', padding: 13, border: '1px solid #8a2418', background: '#fff', color: '#8a2418', fontWeight: 700, fontSize: 14, letterSpacing: '.05em', cursor: 'pointer' }}
          >
            友達を解除する
          </button>
        </form>
      )}

      {user && !isSelf && friendshipStatus === 'pending' && (
        <p style={{ fontSize: 12.5, color: '#8a8168', marginTop: 24, textAlign: 'center', fontStyle: 'italic' }}>
          申請中です。相手の承認をお待ちください。
        </p>
      )}

      {user && !isSelf && !friendshipStatus && (
        <form action={sendFriendRequestByToken} style={{ marginTop: 24 }}>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            style={{ display: 'block', width: '100%', padding: 13, border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 14, letterSpacing: '.05em', cursor: 'pointer' }}
          >
            フレンド申請を送る
          </button>
        </form>
      )}

      {user && (
        <Link href="/friends" style={{ display: 'block', marginTop: 24, marginBottom: 10, padding: '10px 0', textAlign: 'center', fontSize: 11.5, color: '#6b6250', textDecoration: 'none' }}>
          ← 友達一覧に戻る
        </Link>
      )}
    </div>
  )
}
