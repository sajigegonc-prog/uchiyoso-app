import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function LetterDetailPage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { letterId } = params

  const { data: myOcs } = await supabase.from('ocs').select('id, name').eq('user_id', user.id)
  const myOcIds = (myOcs || []).map((oc) => oc.id)
  const myOcNameMap = new Map((myOcs || []).map((oc) => [oc.id, oc.name]))

  const { data: letter } = await supabase
    .from('owl_letters')
    .select('id, sender_oc_id, recipient_oc_id, content, created_at, read_at')
    .eq('id', letterId)
    .maybeSingle()

  if (!letter || (!myOcIds.includes(letter.sender_oc_id) && !myOcIds.includes(letter.recipient_oc_id))) {
    notFound()
  }

  const direction = myOcIds.includes(letter.recipient_oc_id) ? 'received' : 'sent'

  const otherOcId = direction === 'received' ? letter.sender_oc_id : letter.recipient_oc_id
  let otherOcName = myOcNameMap.get(otherOcId)
  if (!otherOcName) {
    const { data: otherOc } = await supabase.from('ocs').select('name').eq('id', otherOcId).maybeSingle()
    otherOcName = otherOc?.name || '名前未設定'
  }
  const myOcName = myOcNameMap.get(direction === 'received' ? letter.recipient_oc_id : letter.sender_oc_id)

  if (direction === 'received' && !letter.read_at) {
    await supabase.from('owl_letters').update({ read_at: new Date().toISOString() }).eq('id', letter.id)
  }

  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 15%, rgba(139,90,43,.16), transparent 40%), radial-gradient(circle at 80% 85%, rgba(92,58,33,.22), transparent 45%), #241a10',
      padding: '28px 20px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <Link href="/owl" style={{ fontSize: 12, color: '#c9a876', textDecoration: 'none' }}>← ふくろう便に戻る</Link>
      </div>

      <div style={{
        marginTop: 20, width: '100%', maxWidth: 380,
        background: 'linear-gradient(160deg, #f3e6c8 0%, #e8d6ac 55%, #ddc794 100%)',
        borderRadius: 4, padding: '30px 26px',
        boxShadow: '0 8px 24px rgba(0,0,0,.35), inset 0 0 40px rgba(139,90,43,.15)',
        border: '1px solid #c9a876',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 6, border: '1px dashed rgba(92,58,33,.3)', borderRadius: 2, pointerEvents: 'none',
        }} />
        <div style={{ textAlign: 'center', fontSize: 11, color: '#8b5a2b', letterSpacing: '.15em', marginBottom: 18 }}>
          🦉 ふくろう便
        </div>
        <div style={{ fontSize: 13, color: '#5c3a21', lineHeight: 1.8 }}>
          {direction === 'received' ? `${otherOcName} より` : `${otherOcName} へ`}
        </div>
        <div style={{
          marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(92,58,33,.25)',
          fontSize: 14.5, color: '#3d2717', lineHeight: 2, whiteSpace: 'pre-wrap',
          minHeight: 120,
        }}>
          {letter.content}
        </div>
        <div style={{ marginTop: 22, textAlign: 'right', fontSize: 12.5, color: '#5c3a21' }}>
          {direction === 'received' ? myOcName : otherOcName}
        </div>
      </div>
    </div>
  )
}
