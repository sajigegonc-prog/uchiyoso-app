'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

const DORMS = ['グリフィンドール', 'ハッフルパフ', 'レイブンクロー', 'スリザリン']

const COMMON_POOL = [
  { place: '図書室', time: '午後', text: '自習をしていた〇〇（申請した側）、羽根ペンのインクを勢いよく振ってしまい、数滴が隣の席の〇〇（申請された側）の羊皮紙に飛んでしまった。' },
  { place: '図書室', time: '午後', text: '最上段の本を取ろうとした〇〇（申請した側）、踏み台がぐらついてバランスを崩し、たまたま通りかかった〇〇（申請された側）の方へ倒れ込んでしまった。' },
  { place: 'ホグズミード', time: '休日の昼', text: '混雑した店内で〇〇（申請した側）、後ろの客に押されて体勢を崩し、隣にいた〇〇（申請された側）に手にしていた小袋をぶつけてしまった。' },
]
const HOUSE_POOL = [
  { place: '大広間', time: '朝食または夕食どき', text: '郵便ふくろうの群れが飛び込んできた拍子に、〇〇（申請した側）の目の前の皿からパンプキンジュースが跳ねて、隣に座っていた〇〇（申請された側）の袖にかかってしまった。' },
  { place: '談話室', time: '夕方〜夜', text: '暖炉の火が急に大きく爆ぜて灰が舞い、驚いた〇〇（申請した側）がとっさに後ずさりした拍子に、近くにいた〇〇（申請された側）とぶつかってしまった。' },
]
const GRADE_POOL = [
  { place: '寮合同授業(薬草学)', time: '午前〜午後', text: '今日のペア作業は、先生の指示で〇〇（申請した側）と〇〇（申請された側）が組むことになった。' },
  { place: '寮合同授業(魔法生物飼育学)', time: '午前〜午後', text: '実習のペア分けで、〇〇（申請した側）と〇〇（申請された側）が同じ班になった。' },
]

function yearGroup(birthDate) {
  if (!birthDate) return null
  const d = new Date(birthDate)
  const m = d.getMonth() + 1
  return m >= 9 ? d.getFullYear() : d.getFullYear() - 1
}

function buildPool(ocA, ocB) {
  const isStudent = (oc) => DORMS.includes(oc?.house)
  const sameHouse = isStudent(ocA) && isStudent(ocB) && ocA.house === ocB.house
  const g1 = yearGroup(ocA?.birth_date)
  const g2 = yearGroup(ocB?.birth_date)
  const gap = g1 != null && g2 != null ? Math.abs(g1 - g2) : 99
  const sameGrade = isStudent(ocA) && isStudent(ocB) && gap === 0

  let pool = [...COMMON_POOL]
  if (sameHouse && gap <= 6) pool = pool.concat(HOUSE_POOL)
  if (sameGrade) pool = pool.concat(GRADE_POOL)
  return pool
}

export async function drawSituation(roomId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: room } = await supabase.from('chat_rooms').select('room_type').eq('id', roomId).maybeSingle()
  const { data: members } = await supabase
    .from('chat_room_members')
    .select('user_id, ocs(name, house, birth_date)')
    .eq('room_id', roomId)
    .is('left_at', null)

  let ocA, ocB
  if (room?.room_type === 'self') {
    if (!members || members.length !== 2) return { error: 'このガチャは、部屋にいるキャラクターがちょうど2人の時だけ使えます' }
    const shuffled = [...members].sort(() => Math.random() - 0.5)
    ocA = shuffled[0].ocs
    ocB = shuffled[1].ocs
  } else {
    if (!members || members.length !== 2) return { error: 'このガチャは1対1の部屋でのみ使えます' }
    const mine = members.find((m) => m.user_id === user.id)
    const other = members.find((m) => m.user_id !== user.id)
    if (!mine || !other) return { error: '判定に失敗しました' }
    ocA = mine.ocs
    ocB = other.ocs
  }

  const pool = buildPool(ocA, ocB)
  const pick = pool[Math.floor(Math.random() * pool.length)]
  const text = pick.text
    .replace(/〇〇（申請した側）/g, ocA?.name || '???')
    .replace(/〇〇（申請された側）/g, ocB?.name || '???')

  await supabase.from('room_ooc_messages').insert({
    room_id: roomId, user_id: user.id, is_system: true, log_type: 'situation_gacha',
    content: `【シチュエーションガチャ】${pick.place}／${pick.time}\n${text}`,
  })
  await supabase.from('chat_rooms').update({ location: pick.place, time_period: pick.time }).eq('id', roomId)

  revalidatePath(`/chat/${roomId}`)
  return { success: true }
}
