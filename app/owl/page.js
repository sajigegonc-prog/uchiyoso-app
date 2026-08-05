import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import LetterCard from './LetterCard'
import AutoRefresh from '@/components/AutoRefresh'

export default async function OwlMailPage() {
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

  const enrichedLetters = (letters || []).map((l) => {
    const direction = myOcIds.includes(l.recipient_oc_id) ? 'received' : 'sent'
    return { ...l, direction, senderName: nameOf(l.sender_oc_id), recipientName: nameOf(l.recipient_oc_id) }
  })

  const received = enrichedLetters.filter((l) => l.direction === 'received')
  const sent = enrichedLetters.filter((l) => l.direction === 'sent')

  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px 110px' }}>
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

      <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 24 }}>
        届いた便り
      </div>
      {received.length === 0 && (
        <p style={{ fontSize: 12.5, color: '#8a8168', marginTop: 10, fontStyle: 'italic' }}>まだ届いていません。</p>
      )}
      {received.map((letter) => <LetterCard key={letter.id} letter={letter} />)}

      <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#6b6250', borderBottom: '1px solid #211d17', paddingBottom: 6, marginTop: 24 }}>
        送った便り
      </div>
      {sent.length === 0 && (
        <p style={{ fontSize: 12.5, color: '#8a8168', marginTop: 10, fontStyle: 'italic' }}>まだ送っていません。</p>
      )}
      {sent.map((letter) => <LetterCard key={letter.id} letter={letter} />)}
    </div>
  )
}
