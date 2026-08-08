import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { confirmRandomMatch } from './matchActions'
import RandomMatchOcIcon from './RandomMatchOcIcon'
import SituationPicker from './SituationPicker'

export const dynamic = 'force-dynamic'

const DORMS = ['グリフィンドール', 'ハッフルパフ', 'レイブンクロー', 'スリザリン']

function isTeacher(oc) {
  return /先生|教授|教師/.test(oc?.house || '')
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const COMMON_POOL = [
  { place: '図書室', time: '午後', text: '自習をしていた〇〇（あなた）、羽根ペンのインクを勢いよく振ってしまい、数滴が隣の席の〇〇（お相手）の羊皮紙に飛んでしまった。' },
  { place: '図書室', time: '午後', text: '最上段の本を取ろうとした〇〇（あなた）、踏み台がぐらついてバランスを崩し、たまたま通りかかった〇〇（お相手）の方へ倒れ込んでしまった。' },
  { place: 'ホグズミード', time: '休日の昼', text: '混雑した店内で〇〇（あなた）、後ろの客に押されて体勢を崩し、隣にいた〇〇（お相手）に手にしていた小袋をぶつけてしまった。' },
  { place: 'ホグワーツの中庭', time: '昼休み', text: '中庭で休憩していた〇〇（あなた）は、フィフィ・フィズビーで遊んでいる生徒をなんとなく眺めていた。ところがその生徒が着地に失敗し、こちらへ倒れ込んでくる。たまたま通りがかった〇〇（お相手）も、その巻き添えになってしまった。' },
  {
    place: 'ホグワーツの{floor}階廊下', time: '{time3}',
    text: '廊下を歩いていた〇〇（あなた）の目の前に、噛みつきフリスビーが突然飛んできた。とっさに身をかわしたものの、その先ではまだフリスビーに気づいていない〇〇（お相手）が、こちらに向かって歩いてきていた。',
  },
  {
    place: 'ホグワーツの大階段', time: '{time3}',
    text: '動く階段が急に切り替わり、目的の踊り場にたどり着けなくなってしまった〇〇（あなた）。同じように足止めを食らっていた〇〇（お相手）と、しばらく一緒に別の道を探すことになった。',
    excludeIf: (ocA, ocB) => isTeacher(ocA) && isTeacher(ocB),
  },
  {
    place: '温室前', time: '授業前後',
    text: '温室の前で列を作っていた〇〇（あなた）、うっかり足を滑らせて肥料の袋を落としてしまい、辺り一面が土まみれに。隣にいた〇〇（お相手）も巻き込まれてしまった。',
    excludeIf: (ocA, ocB) => isTeacher(ocA) && isTeacher(ocB),
  },
  {
    place: 'ふくろう小屋への階段', time: '朝',
    text: '手紙を出しに来た〇〇（あなた）、階段の途中で足を止めて休んでいると、後ろから来た〇〇（お相手）に軽くぶつかられてしまった。',
    excludeIf: (ocA, ocB) => isTeacher(ocA) && isTeacher(ocB),
  },
  {
    place: 'ホグワーツの空き教室', time: 'いつでも',
    text: '急な雨に降られて空き教室に駆け込んだ〇〇（あなた）。少し遅れて、同じく雨宿りに来た〇〇（お相手）も駆け込んできた。',
    excludeIf: (ocA, ocB) => isTeacher(ocA) && isTeacher(ocB),
  },
  {
    place: 'トロフィールーム', time: '放課後',
    text: '古いトロフィーの1つが独りでにぐらつき、けたたましい音を立てて床に転がり落ちた。慌てて周囲を見回した〇〇（あなた）の目に映ったのは、同じく驚いて固まっている〇〇（お相手）の姿だった。',
    excludeIf: (ocA, ocB) => isTeacher(ocA) && isTeacher(ocB),
  },
  {
    place: 'ホグワーツの{floor}階回廊(甲冑の並ぶ場所)', time: '夜',
    text: '通りかかった瞬間、1体の甲冑がひとりでに兜の面頬をカチャリと開閉させた。〇〇（あなた）が思わず声を上げると、少し離れた場所で同じものを見ていた〇〇（お相手）と目が合った。',
    excludeIf: (ocA, ocB) => isTeacher(ocA) && isTeacher(ocB),
  },
  {
    place: '魔法薬学の教室', time: '放課後',
    text: '提出し忘れた課題の薬を取りに戻った〇〇（あなた）。瓶を持ち上げた拍子に薬が沸騰して、教室中に色とりどりの煙が充満してしまった。煙にむせながら逃げ込んだ廊下で、同じ理由で戻ってきていた〇〇（お相手）と鉢合わせた。',
    excludeIf: (ocA, ocB) => isTeacher(ocA) && isTeacher(ocB),
  },
  {
    place: 'ゾンコの悪戯専門店', time: '休日の午後',
    text: '陳列棚の商品を眺めていた〇〇（あなた）。うっかり触れた拍子に「くしゃみ煙玉」が作動し、店内に煙が充満して盛大なくしゃみの連鎖が起きてしまう。近くにいた〇〇（お相手）も、その渦中に巻き込まれた。',
  },
  {
    place: 'ハニーデュークス', time: '休日の昼',
    text: '「異常な味」コーナーを〇〇（あなた）が通りがかった時、なにかの拍子で高く積まれた箱の山がガラガラと崩れてきた。避けた先で、たまたま箱のひとつから飛び出した「ゴキブリ・ゴソゴソ豆板」がひとつ、〇〇（お相手）の口に入っていくのを目撃してしまった。',
  },
  {
    place: '三本の箒', time: '休日の夕方',
    text: '注文したはずのバタービールがなかなか来ないと思っていたら、店員が間違えて〇〇（あなた）のテーブルに山盛りの料理を運んできてしまう。困惑していると、本来この料理を頼んだらしい〇〇（お相手）が、隣のテーブルから声をかけてきた。',
  },
  {
    place: 'マダム・パディフットの喫茶店', time: '休日の午後',
    text: 'カップル向けの店内、1人で入るのが少し気まずかった〇〇（あなた）。席がそこしか空いておらず、相席をお願いすることになった相手が〇〇（お相手）だった。',
  },
  {
    place: 'J・ピピン魔法薬店', time: '休日の昼',
    text: '薬瓶を選んでいた〇〇（あなた）。棚から取ろうとした{drug}の瓶が滑り落ち、同じく薬瓶を探していた隣の〇〇（お相手）にかかってしまった！',
  },
]
const HOUSE_POOL = [
  { place: '大広間', time: '朝食または夕食どき', text: '郵便ふくろうの群れが飛び込んできた拍子に、〇〇（あなた）の目の前の皿からパンプキンジュースが跳ねて、隣に座っていた〇〇（お相手）の袖にかかってしまった。' },
  { place: '談話室', time: '夕方〜夜', text: '暖炉の火が急に大きく爆ぜて灰が舞い、驚いた〇〇（あなた）がとっさに後ずさりした拍子に、近くにいた〇〇（お相手）とぶつかってしまった。' },
  { place: 'クィディッチ競技場の観覧席', time: '試合中', text: 'ブラッジャーが観客席の方へ逸れて飛んできて、悲鳴とともに一斉に身をかがめる観客たち。体勢を崩した〇〇（あなた）が、隣にいた〇〇（お相手）の方へ倒れ込んでしまった。' },
]
const HOUSE_SPECIFIC_POOL = [
  { house: 'スリザリン', place: 'スリザリンの談話室', time: '夕食後', text: '談話室で休憩していた〇〇（あなた）は、窓から湖を眺めていた。すると、見たこともない珍しい魔法生物が泳いでくるのが見えた。驚いてふと隣を見ると、〇〇（お相手）も同じ光景を目撃していた。' },
  { house: 'ハッフルパフ', place: 'ハッフルパフ寮入口', time: '{time_lunch_dinner}', text: '授業からの帰り道、〇〇（あなた）が寮の樽を開けようとリズムよく叩いていると、急いでいた生徒がぶつかってきて、そのリズムが狂ってしまった。とたんに樽から酢が噴き出し、〇〇（あなた）は頭からお酢まみれに。ふと横を見ると、たまたま居合わせた〇〇（お相手）も、同じくお酢まみれになっていた。' },
  { house: 'レイブンクロー', place: 'レイブンクローの談話室(星空の間)', time: '夜', text: '天井に星空が映し出される談話室で、〇〇（あなた）は課題をしているうちについうたた寝してしまい、机に突っ伏した拍子にインクの小瓶を倒してしまう。同じテーブルの端にいた〇〇（お相手）の課題にまでインクが飛び散ってしまい、二人揃って慌てて拭き取ることになった。' },
  { house: 'グリフィンドール', place: 'グリフィンドール寮入口', time: '{time_noon_night}', text: 'グリフィンドールの寮の入口で、太った婦人はなかなか〇〇（あなた）の合言葉を聞いてくれない。最近覚えた歌を披露したくてたまらないらしく、オペラを熱唱し続けている。そこへ偶然、〇〇（お相手）も寮に帰ってきた。太った婦人は、相変わらず熱唱中だった。' },
]
const GRADE_POOL = [
  { place: '寮合同授業(薬草学)', time: '午前〜午後', text: '今日のペア作業は、先生の指示で〇〇（あなた）と〇〇（お相手）が組むことになった。' },
  { place: '寮合同授業(魔法生物飼育学)', time: '午前〜午後', text: '実習のペア分けで、〇〇（あなた）と〇〇（お相手）が同じ班になった。' },
]
const AGE_POOL = [
  {
    place: '使われていない教室の陰', time: '消灯後',
    text: '消灯後、廊下を歩いていた〇〇（あなた）の耳に、フィルチとミセス・ノリスの足音が近づいてくるのが聞こえた。とっさに近くの物陰に飛び込むと、そこには先に隠れていた〇〇（お相手）がいた。',
  },
]

const DRUGS = ['スリークイージーの直毛薬', '元気爆発薬', '戯言薬', 'ふくれ薬', '髪を逆立てる薬', 'しゃっくり咳薬']

function resolveRandomTokens(item) {
  const floor = String(1 + Math.floor(Math.random() * 7))
  const time3 = pickRandom(['朝', '昼', '夜'])
  const timeLunchDinner = pickRandom(['昼休み', '夕食前'])
  const timeNoonNight = pickRandom(['昼', '夜'])
  const drug = pickRandom(DRUGS)
  return {
    place: item.place.replace('{floor}', floor),
    time: item.time
      .replace('{time3}', time3)
      .replace('{time_lunch_dinner}', timeLunchDinner)
      .replace('{time_noon_night}', timeNoonNight),
    text: item.text.replace('{drug}', drug),
    excludeIf: item.excludeIf,
  }
}

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
  return diff > 0 ? `あなたより${rounded}歳年上です` : `あなたより${rounded}歳年下です`
}

const NOTE_EXAMPLES = [
  '先生と生徒で立場が違うので、まず中の人チャットですり合わせしてからやりましょう！',
  '初対面という設定で大丈夫です。緊張しつつ挨拶する感じから始められたら',
]

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

  const MAX_PLAUSIBLE_AGE_GAP = 60
  function ageGapYears(a, b) {
    if (!a || !b) return 0
    return Math.abs((new Date(a) - new Date(b)) / (365.25 * 24 * 60 * 60 * 1000))
  }

  const myOc = myOcs[Math.floor(Math.random() * myOcs.length)]
  const plausibleFriendOcs = eligibleFriendOcs.filter(
    (f) => ageGapYears(myOc.birth_date, f.birth_date) <= MAX_PLAUSIBLE_AGE_GAP
  )
  const candidatePool = plausibleFriendOcs.length > 0 ? plausibleFriendOcs : eligibleFriendOcs
  const friendOc = candidatePool[Math.floor(Math.random() * candidatePool.length)]

  const isStudent = (oc) => DORMS.includes(oc?.house)
  const g1 = yearGroup(myOc.birth_date)
  const g2 = yearGroup(friendOc.birth_date)
  const gap = g1 != null && g2 != null ? Math.abs(g1 - g2) : 99
  const bothStudents = isStudent(myOc) && isStudent(friendOc)
  const contemporaneous = !bothStudents || gap <= 6
  const sameHouse = bothStudents && myOc.house === friendOc.house
  const sameGrade = bothStudents && gap === 0

  let pool = contemporaneous ? [...COMMON_POOL] : []
  if (sameHouse && contemporaneous) {
    pool = pool.concat(HOUSE_POOL)
    pool = pool.concat(HOUSE_SPECIFIC_POOL.filter((item) => item.house === myOc.house))
  }
  if (sameGrade) pool = pool.concat(GRADE_POOL)
  if (bothStudents && gap <= 6) pool = pool.concat(AGE_POOL)
  pool = pool.filter((item) => !item.excludeIf || !item.excludeIf(myOc, friendOc))
  if (pool.length === 0) pool = COMMON_POOL

  const picked = pickRandom(pool)
  const pick = resolveRandomTokens(picked)
  const situationText = pick.text.replace(/〇〇（あなた）/g, myOc.name).replace(/〇〇（お相手）/g, friendOc.name)
  const gachaPick = { place: pick.place, time: pick.time, text: situationText }
  const ageDiffLabel = ageLabel(myOc.birth_date, friendOc.birth_date)

  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 24, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>ランダムマッチング</div>
      </div>

      <div style={{ width: '100%', maxWidth: 360, border: '4px double #211d17', padding: 18, textAlign: 'center', marginTop: 20, background: '#fff' }}>
        <div style={{ fontSize: 9, color: '#8a8168', letterSpacing: '.1em', marginBottom: 8 }}>🔒 お相手はランダムで決定済み・固定</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <RandomMatchOcIcon name={myOc.name} iconUrl={myOc.icon_url} house={myOc.house} ageDiffLabel="あなたです" />
          <span style={{ fontSize: 11, color: '#8a8168' }}>×</span>
          <RandomMatchOcIcon name={friendOc.name} iconUrl={friendOc.icon_url} house={friendOc.house} ageDiffLabel={ageDiffLabel} />
        </div>
        <div style={{ fontSize: 9.5, color: '#8a8168', marginBottom: 4 }}>アイコンをタップして、お相手の詳細をご確認ください。</div>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{myOc.name} × {friendOc.name}</div>
      </div>

      <SituationPicker
        myOcId={myOc.id}
        friendOcId={friendOc.id}
        gachaPick={gachaPick}
        noteExamples={NOTE_EXAMPLES}
        confirmAction={confirmRandomMatch}
      />

      <p style={{ fontSize: 10.5, color: '#8a8168', marginTop: 14, textAlign: 'center', fontStyle: 'italic', lineHeight: 1.8 }}>
        別の友達を探したい場合は、画面を上にスワイプして更新してください
      </p>
      <Link href="/chat" style={{ display: 'block', marginTop: 20, marginBottom: 30, fontSize: 11.5, color: '#6b6250' }}>やっぱりやめる</Link>
    </div>
  )
}
