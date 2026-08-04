import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import LetterCard from './LetterCard'

export default async function OwlMailPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: myOcs } = await supabase.from('ocs').select('id, name').eq('user_id', user.id)
  const myOcIds = (myOcs || []).map((oc) => oc.id)
  const myOcNameMap = new Map((myOcs || []).map((oc) => [oc.id, oc.name]))

  if (myOcIds.length === 0) {
    return (
      <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh', padding: '28px 20px 100px' }}>
        <h1 style={{ fontSize: 18, color: '#241a10', fontWeight: 700 }}>ふくろう便</h1>
        <p style={{ fontSize: 13, color: '#8b7355', marginTop: 12 }}>先にOCを登録してください。</p>
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
    return {
      ...l,
      direction,
      senderName: nameOf(l.sender_oc_id),
      recipientName: nameOf(l.recipient_oc_id),
    }
  })

  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh', padding: '28px 20px 100px' }}>
      <h1 style={{ fontSize: 18, color: '#241a10', fontWeight: 700 }}>ふくろう便</h1>

      <Link
        href="/owl/new"
        style={{
          display: 'block', textAlign: 'center', marginTop: 16,
          background: '#8b5a2b', color: '#f3e9d8', fontWeight: 700, fontSize: 14,
          borderRadius: 3, padding: 14, textDecoration: 'none',
        }}
      >
        🦉 手紙を送る
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        {enrichedLetters.length === 0 && (
          <p style={{ fontSize: 13, color: '#8b7355', marginTop: 10 }}>まだ手紙がありません。</p>
        )}
        {enrichedLetters.map((letter) => (
          <LetterCard key={letter.id} letter={letter} />
        ))}
      </div>
    </div>
  )
}
