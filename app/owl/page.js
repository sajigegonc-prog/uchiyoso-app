import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'

export default async function OwlMailPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/')

  return (
    <div style={{
      fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8', minHeight: '100vh',
      padding: '28px 20px 80px',
    }}>
      <h1 style={{ fontSize: 18, color: '#241a10', fontWeight: 700 }}>ふくろう便</h1>
      <p style={{ fontSize: 13, color: '#8b7355', marginTop: 12 }}>準備中です。</p>
    </div>
  )
}
