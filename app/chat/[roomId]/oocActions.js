'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'
import { getT } from '@/lib/i18n/server'

export async function sendOocMessage(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  const content = formData.get('content')?.toString().trim()
  const imageUrl = formData.get('image_url')?.toString()
  if (roomId && (content || imageUrl)) {
    const row = { room_id: roomId, user_id: user.id, content: content || '' }
    if (imageUrl) {
      row.image_url = imageUrl
      row.image_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
    await supabase.from('room_ooc_messages').insert(row)
  }
  revalidatePath(`/chat/${roomId}`)
}


export async function markOocRead(roomId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !roomId) return
  await supabase
    .from('chat_room_members')
    .update({ ooc_last_read_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id)
  revalidatePath(`/chat/${roomId}`)
}

export async function openFrogCard(formData) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const roomId = formData.get('room_id')?.toString()
  if (!roomId) return { error: t('部屋情報が取得できませんでした。') }
  const openerName = formData.get('speaker_name')?.toString() || t('名前未設定')
  const { count, error: countError } = await supabase.from('frog_cards').select('id', { count: 'exact', head: true })
  if (countError || !count) return { error: t('カードデータが見つかりませんでした。') }
  const randomOffset = Math.floor(Math.random() * count)
  const { data: cards, error: cardError } = await supabase.from('frog_cards').select('name, description').range(randomOffset, randomOffset)
  const rawCard = cards?.[0]
  const card = rawCard ? { ...rawCard, name: t(rawCard.name), description: t(rawCard.description) } : rawCard
  if (cardError || !card) return { error: t('カードの取得に失敗しました。') }
  await supabase.from('room_ooc_messages').insert({
    room_id: roomId, user_id: user.id,
    content: t('{opener} が、蛙チョコを開けました → {card}', { opener: openerName, card: `${card.name}\n${card.description}` }),
    is_system: true, log_type: 'frog_choc',
  })
  revalidatePath(`/chat/${roomId}`)
  return { card }
}

export async function markOocReadWithCount(roomId) {
  return markOocRead(roomId)
}
