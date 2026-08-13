import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: expired } = await supabase
    .from('room_ooc_messages')
    .select('id, image_url')
    .not('image_url', 'is', null)
    .lt('image_expires_at', new Date().toISOString())

  for (const row of expired || []) {
    try {
      const url = new URL(row.image_url)
      const path = url.pathname.split('/ooc-images/')[1]
      if (path) {
        await supabase.storage.from('ooc-images').remove([path])
      }
    } catch (e) {
      console.error('画像削除エラー:', row.id, e)
    }
  }

  const ids = (expired || []).map((r) => r.id)
  if (ids.length > 0) {
    await supabase.from('room_ooc_messages').update({ image_url: null, image_expires_at: null }).in('id', ids)
  }

  return Response.json({ deleted: ids.length })
}
