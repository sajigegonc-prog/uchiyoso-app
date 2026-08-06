import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { confirmRandomMatch } from './matchActions'
import RandomMatchOcIcon from './RandomMatchOcIcon'

const DORMS = ['グリフィンドール', 'ハッフルパフ', 'レイブンクロー', 'スリザリン']
const COMMON_POOL = [
  { place: '図書室', time: '午後', text: '自習をしていた〇〇（あなた）、羽根ペンのインクを勢いよく振ってしまい、数滴が隣の席の〇〇（お相手）の羊皮紙に飛んでしまった。' },
  { place: '図書室', time: '午後', text: '最上段の本を取ろうとした〇〇（あなた）、踏み台がぐらついてバランスを崩し、たまたま通りかかった〇〇（お相手）の方へ倒れ込んでしまった。' },
  { place: 'ホグズミード', time: '休日の昼', text: '混雑した店内で〇〇（あなた）、後ろの客に押されて体勢を崩し、隣にいた〇〇（お相手）に手にしていた小袋をぶつけてしまった。' },
]
const HOUSE_POOL = [
  { place: '大広間', time: '朝食または夕食どき', text: '郵便ふくろうの群れが飛び込んできた拍子に、〇〇（あなた）の目の前の皿からパンプキンジュースが跳ねて、隣に座っていた〇〇（お相手）の袖にかかってしまった。' },
  { place: '談話室', time: '夕方〜夜', text: '暖炉の火が急に大きく爆ぜて灰が舞い、驚いた〇〇（あなた）がとっさに後ずさりした拍子に、近くにいた〇〇（お相手）とぶつかってしまった。' },
]
const GRADE_POOL = [
  { place: '寮合同授業(薬草学)', time: '午前〜午後', text: '今日のペア作業は、先生の指示で〇〇（あなた）と〇〇（お相手）が組むことになった。' },
  { place: '寮合同授業(魔法生物飼育学)', time: '午前〜午後', text: '実習のペア分けで、〇〇（あなた）と〇〇（お相手）が同じ班になった。' },
]
function yearGroup(birthDate) {
  if (!birthDate) return null
  const d = new Date(birthDate)
  return d.getMonth() + 1 >= 9 ? d.getFullYear() : d.getFullYear() - 1
}
function ageLabel(myBirth, otherBirth) {
  if (!myBirth || !otherBirth) return '年齢は不明です'
  const diff = (new Date(myBirth) - new Date(otherBirth)) / (365.25 * 24 * 60 * 60 * 1000)
  const rounded = Math.round(Math.abs(diff))
  if (rounded === 0) return '同い年です'
  return diff > 0 ? `あなたより${rounded}歳年下です` : `あなたより${rounded}歳年上です`
}

export default async function RandomMatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: myOcs } = await supabase.from('ocs').select('id, name, house, birth_date, icon_url').eq('user_id', user.id).eq('is_dream_partner', false)
  const { data: friendOcs } = await supabase.rpc('list_friend_ocs')
  const friendOcIds = (friendOcs || []).map((f) => f.oc_id)
  const { data: friendOcDetails } = friendOcIds.length > 0
    ? await supabase.from('ocs').select('id, name, house, birth_date, icon_url').in('id', friendOcIds)
    : { data: [] }

  const { data: existing1on1 } = await supabase
    .from('chat_room_members')
    .select('room_id, chat_rooms!inner(room_type)')
    .eq('user_id', user.id)
    .eq('chat_rooms.room_type', 'friend_1on1')
  const roomIds = (existing1on1 || []).map((r) => r.room_id)
  const { data: existingPartners } = roomIds.length > 0
    ? await supabase.from('chat_room_members').select('oc_id').in('room_id', roomIds).neq('user_id', user.id)
    : { data: [] }
  const excludedOcIds = new Set((existingPartners || []).map((p) => p.oc_id))

  const eligibleFriendOcs = (friendOcDetails || []).filter((f) => !excludedOcIds.has(f.id))

  if (!myOcs || myOcs.length === 0 || eligibleFriendOcs.length === 0) {
    return (
      <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#8a8168', marginTop: 40, fontStyle: 'italic' }}>
          今マッチングできるお相手がいません。（すでに全員と1:1のお部屋があるか、OCが未登録です）
        </p>
        <Link href="/chat" style={{ display: 'block', marginTop: 20, fontSize: 12, color: '#6b6250' }}>← 一覧に戻る</Link>
      </div>
    )
  }

  const myOc = myOcs[Math.floor(Math.random() * myOcs.length)]
  const friendOc = eligibleFriendOcs[Math.floor(Math.random() * eligibleFriendOcs.length)]

  const isStudent = (oc) => DORMS.includes(oc?.house)
  const sameHouse = isStudent(myOc) && isStudent(friendOc) && myOc.house === friendOc.house
  const g1 = yearGroup(myOc.birth_date)
  const g2 = yearGroup(friendOc.birth_date)
  const gap = g1 != null && g2 != null ? Math.abs(g1 - g2) : 99
  const sameGrade = isStudent(myOc) && isStudent(friendOc) && gap === 0

  let pool = [...COMMON_POOL]
  if (sameHouse && gap <= 6) pool = pool.concat(HOUSE_POOL)
  if (sameGrade) pool = pool.concat(GRADE_POOL)
  const pick = pool[Math.floor(Math.random() * pool.length)]
  const situationText = pick.text.replace(/〇〇（あなた）/g, myOc.name).replace(/〇〇（お相手）/g, friendOc.name)
  const ageDiffLabel = ageLabel(myOc.birth_date, friendOc.birth_date)

  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 24, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>ランダムマッチング</div>
      </div>
      <div style={{ width: '100%', maxWidth: 360, border: '4px double #211d17', padding: 18, textAlign: 'center', marginTop: 20, background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <RandomMatchOcIcon name={myOc.name} iconUrl={myOc.icon_url} house={myOc.house} ageDiffLabel="あなたです" />
          <span style={{ fontSize: 11, color: '#8a8168' }}>×</span>
          <RandomMatchOcIcon name={friendOc.name} iconUrl={friendOc.icon_url} house={friendOc.house} ageDiffLabel={ageDiffLabel} />
        </div>
        <div style={{ fontSize: 9.5, color: '#8a8168', marginBottom: 10 }}>アイコンをタップして、お相手の詳細をご確認ください。</div>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{myOc.name} × {friendOc.name}</div>
        <div style={{ fontSize: 10.5, color: '#8a8168', marginTop: 8 }}>{pick.place}／{pick.time}</div>
        <div style={{ fontSize: 12.5, color: '#211d17', marginTop: 8, lineHeight: 1.8 }}>{situationText}</div>
      </div>
      <form action={confirmRandomMatch} style={{ width: '100%', maxWidth: 360, marginTop: 16 }}>
        <input type="hidden" name="my_oc_id" value={myOc.id} />
        <input type="hidden" name="friend_oc_id" value={friendOc.id} />
        <input type="hidden" name="location" value={pick.place} />
        <input type="hidden" name="time_period" value={pick.time} />
        <input type="hidden" name="situation_text" value={situationText} />
        <button type="submit" style={{ width: '100%', padding: 13, background: '#211d17', color: '#f4eee0', border: 'none', fontWeight: 700, fontSize: 13 }}>このお部屋を作る</button>
      </form>
      <Link href="/chat" style={{ display: 'block', marginTop: 20, fontSize: 11.5, color: '#6b6250' }}>やっぱりやめる</Link>
    </div>
  )
}
