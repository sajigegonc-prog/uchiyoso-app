'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function sendOocMessage(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  const content = formData.get('content')?.toString().trim()
  if (roomId && content) {
    await supabase.from('room_ooc_messages').insert({
      room_id: roomId,
      user_id: user.id,
      content,
    })
  }
  revalidatePath(`/chat/${roomId}`)
}

export async function openFrogCard(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  if (!roomId) return { error: '部屋情報が取得できませんでした。' }

  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
  const openerName = profile?.display_name || '名前未設定'

  const { count, error: countError } = await supabase
    .from('frog_cards')
    .select('id', { count: 'exact', head: true })

  if (countError || !count) {
    return { error: 'カードデータが見つかりませんでした。' }
  }

  const randomOffset = Math.floor(Math.random() * count)
  const { data: cards, error: cardError } = await supabase
    .from('frog_cards')
    .select('name, description')
    .range(randomOffset, randomOffset)

  const card = cards?.[0]
  if (cardError || !card) {
    return { error: 'カードの取得に失敗しました。' }
  }

  await supabase.from('room_ooc_messages').insert({
    room_id: roomId,
    user_id: user.id,
    content: `${openerName} が、蛙チョコを開けました → ${card.name}\n${card.description}`,
    is_system: true,
  })
  revalidatePath(`/chat/${roomId}`)

  return { card }
}
