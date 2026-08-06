import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import RealtimeRefresh from '@/components/RealtimeRefresh'

const VISIBLE_COUNT = 3

export default async function OwlMailPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: myOcs } = await supabase.from('ocs').select('id, name').eq('user_id', user.id)
  const myOcIds = (myOcs || []).map((oc) => oc.id)
  const myOcNameMap = new Map((myOcs || []).map((oc) => [oc.id, oc.name]))

  if (myOcIds.length === 0) {
    return (
      <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px 110px' }}>
        <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
          <div style={{ fontSize: 26, color: '#211d17', fontWeight: 700, fontFamily: 'Georgia, serif' }}>ふくろう便</div>
        </div>
        <p style={{ fontSize: 13, color: '#8a8168', marginTop: 20, fontStyle: 'italic', textAlign: 'center' }}>先にOCを登録してください。</p>
      </div>
    )
  }

  const { data: letters } = await supabase
    .from('owl_letters')
    .select('id, sender_oc_id, recipient_oc_id, content, created_at, read_at')
    .or(`sender_oc_id.in.(${myOcIds.join(',')}),recipient_oc_id.in.(${myOcIds.join(',')})`)
    .order('created_at', { ascending: false })

  const otherOcIds = [...new Set((letters || []).flatMap((l) => [l.sender_oc_id, l.recipient_oc_id]).filter((id) => !myOcIds.includes(id)))]
  const { data: otherOcs } = otherOcIds.length > 0
    ? await supabase.from('ocs').select('id, name').in('id', otherOcIds)
    : { data: [] }
  const otherOcNameMap = new Map((otherOcs || []).map((oc) => [oc.id, oc.name]))

  function nameOf(id) {
    return myOcNameMap.get(id) || otherOcNameMap.get(id) || '名前未設定'
  }

  const enriched = (letters || []).map((l) => {
    const isReceived = myOcIds.includes(l.recipient_oc_id)
    return {
      ...l,
      isReceived,
      unread: isReceived && !l.read_at,
      myOcId: isReceived ? l.recipient_oc_id : l.sender_oc_id,
      otherOcName: nameOf(isReceived ? l.sender_oc_id : l.recipient_oc_id),
    }
  })

  const received = enriched.filter((l) => l.isReceived)
  const sent = enriched.filter((l) => !l.isReceived)

  const receivedGroupMap = new Map()
  for (const l of received) {
    if (!receivedGroupMap.has(l.myOcId)) {
      receivedGroupMap.set(l.myOcId, { myOcId: l.myOcId, myOcName: nameOf(l.myOcId), letters: [] })
    }
    receivedGroupMap.get(l.myOcId).letters.push(l)
  }
  const receivedGroups = Array.from(receivedGroupMap.values()).sort((a, b) => {
    const ta = new Date(a.letters[0]?.created_at || 0).getTime()
    const tb = new Date(b.letters[0]?.created_at || 0).getTime()
    return tb - ta
  })

  const expandedIds = new Set((searchParams?.expand || '').split(',').filter(Boolean))

  function LetterRow({ letter }) {
    return (
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'linear-gradient(160deg, #f3e6c8 0%, #e8d6ac 55%, #ddc794 100%)',
          opacity: letter.unread ? 1 : 0.55,
          border: '1px solid #c9a876', padding: '10px 10px', marginTop: 8,
        }}
      >
        <Link href={`/owl/${letter.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flex: 1 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: letter.unread ? '#8a2418' : 'transparent' }} />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: letter.unread ? 700 : 400, color: '#3d2c14', fontFamily: 'Georgia, serif' }}>
              {letter.isReceived ? `${letter.otherOcName} より` : `${letter.otherOcName} へ`}
            </div>
            {letter.unread && (
              <div style={{ fontSize: 9.5, color: '#7a6537', marginTop: 2, fontStyle: 'italic' }}>未開封</div>
            )}
          </div>
        </Link>
        
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px 110px' }}>
      <RealtimeRefresh tables={['owl_letters']} fallbackMs={15000} />
      <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 26, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>ふくろう便</div>
      </div>

      <Link
        href="/owl/new"
        style={{
          display: 'block', textAlign: 'center', marginTop: 18,
          background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 13,
          padding: 13, textDecoration: 'none', letterSpacing: '.05em',
        }}
      >
        + 手紙を送る
      </Link>

      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6 }}>
          もらったもの
        </div>
        {receivedGroups.length === 0 && (
          <p style={{ fontSize: 12.5, color: '#8a8168', marginTop: 10, fontStyle: 'italic' }}>まだ届いていません。</p>
        )}
        {receivedGroups.map((g) => {
          const isExpanded = expandedIds.has(g.myOcId)
          const visibleLetters = isExpanded ? g.letters : g.letters.slice(0, VISIBLE_COUNT)
          const expandParam = [...expandedIds, g.myOcId].join(',')
          return (
            <div key={g.myOcId} style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: '#3d2717', fontWeight: 700, fontFamily: 'Georgia, serif' }}>
                {g.myOcName} 宛
              </div>
              {visibleLetters.map((letter) => <LetterRow key={letter.id} letter={letter} />)}
              {!isExpanded && g.letters.length > VISIBLE_COUNT && (
                <Link
                  href={`/owl?expand=${expandParam}`}
                  style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 11, color: '#6b6250', textDecoration: 'underline' }}
                >
                  もっと見る({g.letters.length - VISIBLE_COUNT}件)
                </Link>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6 }}>
          送ったもの
        </div>
        {sent.length === 0 && (
          <p style={{ fontSize: 12.5, color: '#8a8168', marginTop: 10, fontStyle: 'italic' }}>まだ送っていません。</p>
        )}
        {sent.map((letter) => <LetterRow key={letter.id} letter={letter} />)}
      </div>
    </div>
  )
}
