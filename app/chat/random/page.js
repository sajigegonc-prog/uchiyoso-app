import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { confirmRandomMatch } from './matchActions'
import RandomMatchOcIcon from './RandomMatchOcIcon'
import SituationPicker from './SituationPicker'
import { getT } from '@/lib/i18n/server'
import { generationsCompatible } from '@/lib/generation'

export const dynamic = 'force-dynamic'

const DORMS = ['グリフィンドール', 'ハッフルパフ', 'レイブンクロー', 'スリザリン']

function isTeacher(oc) {
  return /先生|教授|教師/.test(oc?.house || '') || /先生|教授|教師/.test(oc?.career || '')
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
    place: '医務室', time: 'いつでも',
    text: '軽い怪我でベッドに寝かされていた〇〇（あなた）。仕切りのカーテンが急な隙間風でめくれ上がり、隣のベッドにいた〇〇（お相手）と目が合ってしまった。',
    excludeIf: (ocA, ocB) => isTeacher(ocA) && isTeacher(ocB),
  },
  {
    place: '必要の部屋の前の廊下', time: 'いつでも',
    text: '1人になりたくて必要の部屋を求めて3回歩いた〇〇（あなた）。現れた扉を開けると、同じ目的で歩いていたらしい〇〇（お相手）と鉢合わせ、なぜか2人分の願いが混ざった部屋が出来上がっていた。',
    excludeIf: (ocA, ocB) => isTeacher(ocA) && isTeacher(ocB),
  },
  {
    place: 'ホグワーツ特急の通路', time: '出発直後',
    text: '満席の車両が続き、空いている席を探して通路を歩いていた〇〇（あなた）。ようやく見つけた空席のコンパートメントに入ると、先に座っていたのは〇〇（お相手）だった。',
    excludeIf: (ocA, ocB) => isTeacher(ocA) && isTeacher(ocB),
  },
  {
    place: 'ホグワーツ特急の車内(お菓子ワゴン前)', time: '昼',
    text: 'お菓子ワゴンが通りかかり、〇〇（あなた）は迷わず蛙チョコを買い求めた。同じタイミングで手を伸ばしていたのが〇〇（お相手）で、お互い開封することになった。（蛙チョコ機能をお使いください）',
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
    place: 'ハニーデュークス', time: '休日の昼',
    text: '新作の蛙チョコを試食用に配っていた店員が、〇〇（あなた）と〇〇（お相手）の2人にちょうど同じタイミングで手渡してきた。（蛙チョコ機能をお使いください）',
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
  {
    place: 'フローリアン・フォーテスキューのアイスクリーム店', time: '休日',
    text: '新作アイスの試食を配っていた店員から、〇〇（あなた）は思いがけず2つ分を渡されてしまう。1つ余ってしまい困っていると、隣で同じように余らせていたのが〇〇（お相手）だった。',
  },
  {
    place: 'イーロップのふくろう百貨店', time: '休日',
    text: '店内のふくろうたちが一斉に鳴き始め、その中の1羽が籠から抜け出して店内を飛び回る騒ぎに。逃げ惑うふくろうを避けようとした〇〇（あなた）の目の前に、同じく避難していた〇〇（お相手）がいた。',
  },
  {
    place: 'フローリシュ・アンド・ブロッツ書店', time: '休日',
    text: '本の山を運んでいた店員が通路でバランスを崩し、積み上げられた本が雪崩のように崩れ落ちる。とっさに避けた先で、同じく巻き込まれていた〇〇（お相手）と鉢合わせた。',
  },
  {
    place: 'マダム・マルキンの洋装店', time: '休日',
    text: '採寸用のメジャーが暴走し、〇〇（あなた）の体に巻きつき始めたと思ったら、勢い余って隣にいた〇〇（お相手）まで一緒にぐるぐると巻き込んでしまった。',
  },
  {
    place: 'ウィーズリー・ウィザード・ウィーズ', time: '休日',
    text: '陳列されていた新商品のいたずらグッズを〇〇（あなた）が手に取った瞬間、盛大な音と煙を発して作動してしまう。近くにいた〇〇（お相手）も、その煙をもろに浴びることになった。',
  },
  {
    place: '', time: '',
    text: '宿題のために急遽必要になった{book}を借りようと図書室に来た〇〇（あなた）。ところが貸出表を見ると、そこにはすでに〇〇（お相手）の名前が記されていた。',
  },
  {
    place: '', time: '',
    text: '足元に見慣れない小さな物が落ちているのに気づいた〇〇（あなた）。拾い上げてみても持ち主の見当がつかず困っていると、ちょうど通りかかった〇〇（お相手）に声をかけられた。',
  },
  {
    place: '', time: '',
    text: '自分の忘れ物を取りに戻った〇〇（あなた）。ところが目当ての場所には、同じく忘れ物を取りに来たらしい〇〇（お相手）の姿があった。',
  },
  {
    place: '', time: '',
    text: '突然の強風に、〇〇（あなた）が持っていた紙の束が一斉に舞い上がってしまう。慌てて追いかけていると、飛んできた1枚を〇〇（お相手）が偶然キャッチしてくれた。',
  },
  {
    place: '', time: '',
    text: '考えごとをしながら歩いていた〇〇（あなた）。背後から近づいてきた足音に気づかず、声をかけられて飛び上がるほど驚いてしまった。振り返るとそこにいたのは〇〇（お相手）だった。',
  },
]
const HOUSE_POOL = [
  { place: '大広間', time: '朝食または夕食どき', text: '郵便ふくろうの群れが飛び込んできた拍子に、〇〇（あなた）の目の前の皿からパンプキンジュースが跳ねて、隣に座っていた〇〇（お相手）の袖にかかってしまった。' },
  { place: '談話室', time: '夕方〜夜', text: '暖炉の火が急に大きく爆ぜて灰が舞い、驚いた〇〇（あなた）がとっさに後ずさりした拍子に、近くにいた〇〇（お相手）とぶつかってしまった。' },
  { place: 'クィディッチ競技場の観覧席', time: '試合中', text: 'ブラッジャーが観客席の方へ逸れて飛んできて、悲鳴とともに一斉に身をかがめる観客たち。体勢を崩した〇〇（あなた）が、隣にいた〇〇（お相手）の方へ倒れ込んでしまった。' },
  { place: '大広間', time: '夕食のデザートタイム', text: 'デザートの盆に紛れて、なぜか蛙チョコの箱が一つ紛れ込んでいた。〇〇（あなた）が首を傾げていると、隣の〇〇（お相手）も同じものを見つけて驚いていた。せっかくなので二人で開けてみることに。（蛙チョコ機能をお使いください）' },
  { place: '自室(寮の寝室)', time: '朝', text: '差出人不明のフクロウ便が届き、開けてみると中には蛙チョコが1つ。同室の〇〇（あなた）が〇〇（お相手）に見せると、同じものが届いていたと分かった。（蛙チョコ機能をお使いください）' },
]
const HOUSE_SPECIFIC_POOL = [
  { house: 'スリザリン', place: 'スリザリンの談話室', time: '夕食後', text: '談話室で休憩していた〇〇（あなた）は、窓から湖を眺めていた。すると、見たこともない珍しい魔法生物が泳いでくるのが見えた。驚いてふと隣を見ると、〇〇（お相手）も同じ光景を目撃していた。' },
  { house: 'ハッフルパフ', place: 'ハッフルパフ寮入口', time: '{time_lunch_dinner}', text: '授業からの帰り道、〇〇（あなた）が寮の樽を開けようとリズムよく叩いていると、急いでいた生徒がぶつかってきて、そのリズムが狂ってしまった。とたんに樽から酢が噴き出し、〇〇（あなた）は頭からお酢まみれに。ふと横を見ると、たまたま居合わせた〇〇（お相手）も、同じくお酢まみれになっていた。' },
  { house: 'レイブンクロー', place: 'レイブンクローの談話室(星空の間)', time: '夜', text: '天井に星空が映し出される談話室で、〇〇（あなた）は課題をしているうちについうたた寝してしまい、机に突っ伏した拍子にインクの小瓶を倒してしまう。同じテーブルの端にいた〇〇（お相手）の課題にまでインクが飛び散ってしまい、二人揃って慌てて拭き取ることになった。' },
  { house: 'グリフィンドール', place: 'グリフィンドール寮入口', time: '{time_noon_night}', text: 'グリフィンドールの寮の入口で、太った婦人はなかなか〇〇（あなた）の合言葉を聞いてくれない。最近覚えた歌を披露したくてたまらないらしく、オペラを熱唱し続けている。そこへ偶然、〇〇（お相手）も寮に帰ってきた。太った婦人は、相変わらず熱唱中だった。' },
  { house: "スリザリン", place: "スリザリンの談話室", time: "夜更け",
    text: "暖炉の前の革張りの椅子で眠ってしまった〇〇（あなた）。毛布がかけられていることに気づいて顔を上げると、向かいの席の〇〇（お相手）が、知らん顔で本を読んでいた。" },
  { house: "ハッフルパフ", place: "ハッフルパフの談話室", time: "夕方",
    text: "地下の厨房から差し入れのお菓子を持ち帰った〇〇（あなた）。談話室に入ると、同じく厨房帰りらしい〇〇（お相手）と、お互いが抱えたお菓子の山を見て顔を見合わせた。" },
  { house: "レイブンクロー", place: "レイブンクローの談話室の入口", time: "夕方",
    text: "入口のブロンズのドアノッカーが出した謎かけが、どうしても解けない〇〇（あなた）。後ろで同じ問題に首をひねっていた〇〇（お相手）と、一緒に考えることになった。" },
  { house: "グリフィンドール", place: "グリフィンドールの談話室", time: "夜",
    text: "宿題の山を前に、暖炉の前のいちばんいい席を〇〇（あなた）が確保した。そこへ遅れて入ってきた〇〇（お相手）が、羊皮紙を抱えたまま立ち尽くしている。" },
]
const GRADE_POOL = [
  { place: '寮合同授業(薬草学)', time: '午前〜午後', text: '今日のペア作業は、先生の指示で〇〇（あなた）と〇〇（お相手）が組むことになった。' },
  { place: '寮合同授業(魔法生物飼育学)', time: '午前〜午後', text: '実習のペア分けで、〇〇（あなた）と〇〇（お相手）が同じ班になった。' },
  { place: '大広間(組分け前の待機列)', time: '新学期の夜', text: '組分けを待つ列で、緊張のあまり杖を落としてしまった〇〇（あなた）。拾ってくれたのが、すぐ後ろに並んでいた〇〇（お相手）だった。' },
  { place: '温室(マンドレイクの植え替え中)', time: '授業中', text: '耳当てを外すタイミングを誤り、マンドレイクの悲鳴をまともに聞いてしまった〇〇（あなた）。ふらついて倒れかけたところを、隣にいた〇〇（お相手）に支えられた。' },
  { place: "ホグワーツの校庭(飛行訓練)", time: "午後",
    text: "初めての飛行訓練。箒が言うことをきかず、〇〇（あなた）は地面すれすれをふらふらと飛び回る。すぐ隣では〇〇（お相手）の箒も暴れていて、二人で悲鳴を上げた。" },
]
const AGE_POOL = [
  {
    place: '使われていない教室の陰', time: '消灯後',
    text: '消灯後、廊下を歩いていた〇〇（あなた）の耳に、フィルチとミセス・ノリスの足音が近づいてくるのが聞こえた。とっさに近くの物陰に飛び込むと、そこには先に隠れていた〇〇（お相手）がいた。',
  },
]
const TEACHER_POOL = [
  { place: '魔法省アトリウム', time: '出勤・退勤時', text: '噴水の水が急に勢いを増して吹き上がり、〇〇（あなた）は水しぶきをまともに浴びてしまう。少し離れた場所にいた〇〇（お相手）も、風向きが変わって同じように濡れてしまった。' },
  { place: '魔法省の電話ボックス型エレベーター', time: 'いつでも', text: '目的階のボタンを押したはずが、エレベーターが行き先を無視して勝手に別の階へ向かい出す。同じく閉じ込められていたのが〇〇（お相手）だった。' },
  { place: 'ロンドンの赤い電話ボックス(外来入口)前', time: 'いつでも', text: 'バッジの受け取り口が詰まってしまい、〇〇（あなた）は苦戦していた。後ろで同じく詰まった順番待ちをしていたのが〇〇（お相手）だった。' },
]
const AGE_OR_TEACHER_POOL = [
  { place: '黒湖のほとり', time: '昼下がり', text: '湖面から巨大イカが姿を見せ、大きく水しぶきを上げた。岸辺にいた〇〇（あなた）はまともにそれを浴びてしまい、少し離れた場所にいた〇〇（お相手）も同じく濡れてしまった。' },
]

const STUDENT_POOL = [
  { place: "大広間", time: "朝食どき",
    text: "フクロウ便のはずが、〇〇（あなた）の肩に落とされたのは別の人宛ての手紙だった。宛名の主を探して見回していると、斜め向かいの席で同じように首をかしげている〇〇（お相手）と目が合った。" },
  { place: "闇の魔術に対する防衛術の教室", time: "授業中",
    text: "実技の練習で、先生は〇〇（あなた）と〇〇（お相手）を指名した。杖を構えて向かい合ったものの、お互い緊張で呪文が頭から飛んでしまい、教室に妙な沈黙が流れた。" },
  { place: "クィディッチ競技場", time: "放課後",
    text: "スニッチを追って低く飛びすぎた〇〇（あなた）が、観覧席の下にいた〇〇（お相手）の頭上すれすれを通り過ぎていった。突風にマントがはためき、二人とも思わず首をすくめた。" },
  { place: "図書室", time: "試験前夜",
    text: "試験前夜の図書室。閉館ぎりぎりまで粘っていた〇〇（あなた）が顔を上げると、最後まで残っているのは〇〇（お相手）だけだった。マダム・ピンスの咳払いが静かな室内に響く。" },
  { place: "玄関ホール", time: "ホグズミード行きの日の朝",
    text: "ホグズミード行きの許可証を忘れて、玄関ホールで足止めされてしまった〇〇（あなた）。同じく許可証を忘れて列から外された〇〇（お相手）と、並んで先生の判断を待つことになった。" },
  { place: "黒湖のほとり", time: "昼休み",
    text: "湖畔で昼寝をしていた〇〇（あなた）の足元に、湖から小さな水の魔法生物がひょっこり顔を出した。思わず声を上げると、少し離れた木陰にいた〇〇（お相手）がこちらを振り返った。" },
  { place: "廊下の肖像画の前", time: "放課後",
    text: "廊下の肖像画に道を尋ねた〇〇（あなた）。肖像画は気まぐれに、間違った方向を自信たっぷりに教えてくれた。歩き出した先で、同じ肖像画に尋ねて同じ方向へ向かっていた〇〇（お相手）と顔を合わせた。" },
  { place: "大広間", time: "夕食どき",
    text: "大皿に残った最後の一切れのパイに、〇〇（あなた）と〇〇（お相手）が同時にフォークを伸ばした。お互いに手を止め、譲り合いの沈黙が流れる。" },
  { place: "地下の魔法薬学教室の前", time: "授業前",
    text: "魔法薬学の授業前、教室の扉の前で待っていた〇〇（あなた）。ふと隣を見ると、同じく早く着きすぎた〇〇（お相手）しかいなかった。気まずい沈黙の中、扉はまだ開かない。" },
  { place: "ホグワーツの庭", time: "雪の日",
    text: "雪が積もった朝、雪玉の応酬に巻き込まれた〇〇（あなた）。避けた先で、同じく雪玉を避けようとしていた〇〇（お相手）と肩がぶつかってしまった。" },
]
const ADULT_POOL = [
  { place: "ダイアゴン横丁", time: "休日の昼",
    text: "買い出しの途中、〇〇（あなた）が抱えていた荷物の紐が切れ、中身が石畳に散らばった。拾うのを手伝ってくれたのは、通りがかった〇〇（お相手）だった。" },
  { place: "聖マンゴ魔法疾患傷害病院の待合室", time: "午後",
    text: "待合室の観葉植物が突然くしゃみのような音を立てて胞子をまき散らした。〇〇（あなた）が思わず顔を上げると、隣に座っていた〇〇（お相手）と目が合い、二人とも笑いをこらえることになった。" },
  { place: "漏れ鍋", time: "夜",
    text: "混み合った漏れ鍋のカウンターで、最後のひと席を〇〇（あなた）と〇〇（お相手）が同時に見つけた。" },
  { place: "魔法省の廊下", time: "朝の出勤時",
    text: "書類の山を抱えて廊下を急いでいた〇〇（あなた）。角を曲がった拍子に、同じように急いでいた〇〇（お相手）とぶつかり、書類が混ざり合って床に散らばってしまった。" },
  { place: "同窓会の会場", time: "夜",
    text: "卒業生の集まりで、〇〇（あなた）は昔の顔ぶれを探して会場を歩いていた。見覚えがあるようなないような顔の〇〇（お相手）と、ふと目が合った。" },
  { place: "オリバンダーの店", time: "休日",
    text: "杖の調子を見てもらおうと、順番を待っていた〇〇（あなた）。隣で同じように待っていた〇〇（お相手）の杖が突然火花を散らし、棚の杖を何本か転がしてしまった。" },
  { place: "ノクターン横丁の入口", time: "夕方",
    text: "道に迷って、うっかりノクターン横丁の入口まで来てしまった〇〇（あなた）。引き返そうとしたところで、同じように道を間違えたらしい〇〇（お相手）と鉢合わせた。" },
  { place: "煙突ネットワークの暖炉", time: "朝",
    text: "急ぎの用で煙突飛行を使った〇〇（あなた）。行き先を言い間違え、見知らぬ家の暖炉から転がり出ると、そこにいたのは〇〇（お相手）だった。" },
  { place: "三本の箒", time: "夜",
    text: "満席の三本の箒で、〇〇（あなた）のテーブルに相席を頼んできたのは、〇〇（お相手）だった。" },
  { place: "グリンゴッツ魔法銀行", time: "午前",
    text: "金庫へ向かうトロッコに乗り込んだ〇〇（あなた）。向かいの席にはすでに〇〇（お相手）が座っていて、猛スピードのトロッコの中、二人とも手すりにしがみつくことになった。" },
  { place: "魔法省の来訪者受付", time: "朝",
    text: "来訪者受付で杖の登録を待っていた〇〇（あなた）。前に並んでいた〇〇（お相手）の杖の検査が長引き、二人でしばらく待たされることになった。" },
  { place: "ハグリッドの小屋", time: "午後",
    text: "ハグリッドの小屋でお茶に招かれた〇〇（あなた）。出された岩のように硬いロックケーキを前に、同じく招かれていた〇〇（お相手）と、顔を見合わせて固まってしまった。" },
  { place: "ダイアゴン横丁のクィディッチ用品店", time: "休日",
    text: "ショーウィンドウの新型の箒を眺めていた〇〇（あなた）。ガラスに映った隣の人影は、同じ箒をじっと見つめている〇〇（お相手）だった。" },
]
const STRANGER_POOL = [
  { place: "夜の騎士バスの車内", time: "夜",
    text: "急停車した夜の騎士バスで、〇〇（あなた）はベッドごと通路を滑っていった。止まった先は、〇〇（お相手）のベッドだった。" },
  { place: "キングズ・クロス駅の9と3/4番線", time: "朝",
    text: "壁をくぐり抜けるのに少し迷っていた〇〇（あなた）。背後から声をかけてきたのは、同じ入口を探していた〇〇（お相手）だった。" },
  { place: "漏れ鍋", time: "夕方",
    text: "待ち合わせの相手が現れず、ひとりでバタービールを飲んでいた〇〇（あなた）。隣の席の〇〇（お相手）も、どうやら待ちぼうけを食らっているらしかった。" },
  { place: "ホグズミード村の通り", time: "雨の日",
    text: "突然の土砂降りに、〇〇（あなた）は近くの軒先へ駆け込んだ。先に雨宿りしていた〇〇（お相手）が、少し場所を空けてくれた。" },
  { place: "ホグズミードのふくろう郵便局", time: "午後",
    text: "手紙の宛先を書き間違えて、窓口で突き返された〇〇（あなた）。その様子を、列に並んでいた〇〇（お相手）が見ていた。" },
  { place: "フローリシュ・アンド・ブロッツ書店", time: "休日",
    text: "同じ棚の同じ本に、〇〇（あなた）と〇〇（お相手）が同時に手を伸ばした。それは、最後の1冊だった。" },
  { place: "ダイアゴン横丁への入口", time: "午前",
    text: "レンガの壁の前で、どこを叩けばいいのか分からず立ち往生していた〇〇（あなた）。通りかかった〇〇（お相手）が、杖で軽くレンガを叩いて道を開けてくれた。" },
  { place: "ホグズミード村の雪道", time: "冬の午後",
    text: "凍った道で足を滑らせた〇〇（あなた）を、とっさに支えてくれたのは、通りがかった〇〇（お相手）だった。" },
  { place: "魔法動物ペットショップ", time: "休日",
    text: "檻から逃げ出した小さな魔法生物が、〇〇（あなた）の足元を駆け抜け、〇〇（お相手）のカバンの中へ潜り込んでしまった。" },
  { place: "グリンゴッツの前の階段", time: "午前",
    text: "白い大理石の階段で、〇〇（あなた）は財布の中身をひっくり返してしまった。転がったガリオン金貨を拾ってくれたのは、前を歩いていた〇〇（お相手）だった。" },
]

const FROG_POOL = [
  { place: "ダイアゴン横丁", time: "休日の昼",
    text: "買ったばかりの蛙チョコの箱を開けた瞬間、蛙が〇〇（あなた）の手から飛び出した。跳ねた先で、通りがかった〇〇（お相手）の肩にぴたりと着地した。（蛙チョコ機能をお使いください）" },
  { place: "漏れ鍋", time: "夕方",
    text: "〇〇（あなた）が蛙チョコのカードを裏返すと、見る見るうちに〇〇（お相手）の姿に変わっていった。隣の席で、本人も目を丸くしている。（蛙チョコ機能をお使いください）" },
  { place: "ハニーデュークス", time: "休日の昼",
    text: "ハニーデュークスで蛙チョコを買った〇〇（あなた）。棚に残っていた最後のひと箱を、ちょうど〇〇（お相手）が手に取り、二人はお互いの箱を見比べることになった。（蛙チョコ機能をお使いください）" },
  { place: "ホグワーツの中庭", time: "昼下がり",
    text: "〇〇（あなた）が蛙チョコを開けた拍子に蛙が逃げ出し、芝生の上で追いかけっこになった。蛙を捕まえてくれたのは、近くの石段に腰かけていた〇〇（お相手）だった。（蛙チョコ機能をお使いください）" },
  { place: "ホグズミードのふくろう郵便局", time: "午後",
    text: "届いた小包を開けると、中身は蛙チョコの詰め合わせ。差出人は不明だった。たまたま隣で受け取っていた〇〇（お相手）も、全く同じ小包を受け取っていた。（蛙チョコ機能をお使いください）" },
  { place: "三本の箒", time: "休日の午後",
    text: "〇〇（あなた）と〇〇（お相手）のテーブルに、頼んでいないはずの蛙チョコがひとつ置かれていた。店員は「あちらのお客様から」と言うが、誰のことなのかは分からない。（蛙チョコ機能をお使いください）" },
]
const FROG_STUDENT_POOL = [
  { place: "ホグワーツの図書室", time: "午後",
    text: "マダム・ピンスの目を盗んで蛙チョコを開けた〇〇（あなた）。蛙が書架の間に逃げ込み、追いかけていった先で、同じように蛙を追っていた〇〇（お相手）と鉢合わせた。（蛙チョコ機能をお使いください）" },
  { place: "大広間", time: "朝食どき",
    text: "テーブルの下でこっそり蛙チョコを開けていた〇〇（あなた）。逃げ出した蛙は、〇〇（お相手）の皿のトーストの上へ見事に着地した。（蛙チョコ機能をお使いください）" },
  { place: "ホグワーツの空き教室", time: "放課後",
    text: "カード集めに夢中の〇〇（あなた）。ダンブルドアが3枚続いた末に、ようやく見たことのないカードを引き当てたところへ、〇〇（お相手）が「それ、探してたんだ」と声をかけてきた。（蛙チョコ機能をお使いください）" },
]
const FROG_STRANGER_POOL = [
  { place: "キングズ・クロス駅の9と3/4番線", time: "朝",
    text: "蛙チョコを開けようとした〇〇（あなた）の手から、蛙がホームへ飛び出した。蛙は、ちょうど列車を待っていた〇〇（お相手）の足元で止まった。（蛙チョコ機能をお使いください）" },
  { place: "ダイアゴン横丁", time: "夕方",
    text: "同じ魔法使いのカードばかり何枚も引いてしまった〇〇（あなた）。交換相手を探して声をかけたのが、〇〇（お相手）だった。（蛙チョコ機能をお使いください）" },
  { place: "漏れ鍋", time: "夜",
    text: "蛙チョコを開けたら、カードが2枚入っていた。1枚余ってしまい、隣の席の〇〇（お相手）におすそ分けしようか迷っている。（蛙チョコ機能をお使いください）" },
]

const DRUGS = ['スリークイージーの直毛薬', '元気爆発薬', '戯言薬', 'ふくれ薬', '髪を逆立てる薬', 'しゃっくり咳薬']
const BOOKS = [
  '『魔法薬調合法』(アージニウス・ジガー著)',
  '『魔法史』(バチルダ・バグショット著)',
  '『魔法論』(アドルバート・ワフリング著)',
  '『薬草ときのこ千種』(フィリダ・スポア著)',
  '『世界の肉食植物』',
  '『未来の霧を晴らす』(カッサンドラ・バブラツキー著)',
  '『数秘学と文法学』',
  '『イギリスにおけるマグルの家庭生活と社会的習慣』',
]

function resolveRandomTokens(item, t) {
  const floor = String(1 + Math.floor(Math.random() * 7))
  const time3 = pickRandom(['朝', '昼', '夜'])
  const timeLunchDinner = pickRandom(['昼休み', '夕食前'])
  const timeNoonNight = pickRandom(['昼', '夜'])
  const drug = pickRandom(DRUGS)
  const book = pickRandom(BOOKS)
  return {
    place: t(item.place, { floor }),
    time: t(item.time, { time3: t(time3), time_lunch_dinner: t(timeLunchDinner), time_noon_night: t(timeNoonNight) }),
    text: t(item.text, { drug: t(drug), book: t(book) }),
    excludeIf: item.excludeIf,
  }
}

function yearGroup(birthDate) {
  if (!birthDate) return null
  const d = new Date(birthDate)
  return d.getMonth() + 1 >= 9 ? d.getFullYear() : d.getFullYear() - 1
}
function ageLabel(myBirth, otherBirth, t) {
  if (!myBirth || !otherBirth) return t('年齢は不明です')
  const diff = (new Date(myBirth) - new Date(otherBirth)) / (365.25 * 24 * 60 * 60 * 1000)
  const rounded = Math.round(Math.abs(diff))
  if (rounded === 0) return t('同い年です')
  return diff > 0 ? t('あなたより{n}歳年上です', { n: rounded }) : t('あなたより{n}歳年下です', { n: rounded })
}

const NOTE_EXAMPLES = [
  '先生と生徒で立場が違うので、まず中の人チャットですり合わせしてからやりましょう！',
  '初対面という設定で大丈夫です。緊張しつつ挨拶する感じから始められたら',
]

export default async function RandomMatchPage({ searchParams }) {
  const t = getT()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: myOcs } = await supabase.from('ocs').select('id, name, house, career, birth_date, icon_url').eq('user_id', user.id).eq('is_dream_partner', false)
  const strangerMode = searchParams?.mode === 'stranger'
  let eligibleFriendOcs = []

  if (strangerMode) {
    const { data: meProfile } = await supabase.from('profiles').select('stranger_match_enabled').eq('id', user.id).maybeSingle()
    if (meProfile && meProfile.stranger_match_enabled === false) {
      return (
        <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#8a8168', marginTop: 40, fontStyle: 'italic', lineHeight: 1.8 }}>
            {t('「知らない人とのマッチング」がOFFになっています。')}
          </p>
          <Link href="/ocs" style={{ display: 'block', marginTop: 16, fontSize: 12, color: '#3d2717', textDecoration: 'underline' }}>{t('OC一覧の「マッチング設定」でONにできます')}</Link>
          <Link href="/chat" style={{ display: 'block', marginTop: 20, fontSize: 12, color: '#6b6250' }}>{t('← 一覧に戻る')}</Link>
        </div>
      )
    }
    const { data: candidates } = await supabase.rpc('list_stranger_match_candidates')
    eligibleFriendOcs = (candidates || []).map((c) => ({
      id: c.oc_id, name: c.name, house: c.house, career: c.career, birth_date: c.birth_date, icon_url: c.icon_url,
    }))
  } else {
    const { data: friendOcs } = await supabase.rpc('list_friend_ocs')
    const friendOcIds = (friendOcs || []).map((f) => f.oc_id)
    const { data: friendOcDetails } = friendOcIds.length > 0
      ? await supabase.from('ocs').select('id, name, house, career, birth_date, icon_url').in('id', friendOcIds)
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

    eligibleFriendOcs = (friendOcDetails || []).filter((f) => !excludedOcIds.has(f.id))
  }

  // 知らない人とのマッチは、同じ世代のOC同士だけ（生年月日が未入力のOCは、未入力同士だけ）
  let usableMyOcs = myOcs || []
  if (strangerMode) {
    usableMyOcs = usableMyOcs.filter((oc) => eligibleFriendOcs.some((c) => generationsCompatible(oc.birth_date, c.birth_date)))
  }

  if (usableMyOcs.length === 0 || eligibleFriendOcs.length === 0) {
    return (
      <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#8a8168', marginTop: 40, fontStyle: 'italic' }}>
          {strangerMode ? t('今マッチングできるお相手がいません。（条件の合う方がいないか、OCが未登録です。お相手は同じ世代のOCから選ばれます）') : t('今マッチングできるお相手がいません。（すでに全員と1:1のお部屋があるか、OCが未登録です）')}
        </p>
        <Link href="/chat" style={{ display: 'block', marginTop: 20, fontSize: 12, color: '#6b6250' }}>{t('← 一覧に戻る')}</Link>
      </div>
    )
  }

  const MAX_PLAUSIBLE_AGE_GAP = 60
  function ageGapYears(a, b) {
    if (!a || !b) return 0
    return Math.abs((new Date(a) - new Date(b)) / (365.25 * 24 * 60 * 60 * 1000))
  }

  const myOc = usableMyOcs[Math.floor(Math.random() * usableMyOcs.length)]
  const sameGenOcs = strangerMode
    ? eligibleFriendOcs.filter((f) => generationsCompatible(myOc.birth_date, f.birth_date))
    : eligibleFriendOcs
  const plausibleFriendOcs = sameGenOcs.filter(
    (f) => ageGapYears(myOc.birth_date, f.birth_date) <= MAX_PLAUSIBLE_AGE_GAP
  )
  const candidatePool = plausibleFriendOcs.length > 0 ? plausibleFriendOcs : sameGenOcs
  const friendOc = candidatePool[Math.floor(Math.random() * candidatePool.length)]
  let friendPartners = ''
  if (strangerMode) {
    const { data: partnerText } = await supabase.rpc('stranger_partner_names', { _oc_id: friendOc.id })
    friendPartners = partnerText || ''
  }

  const isStudent = (oc) => DORMS.includes(oc?.house)
  const g1 = yearGroup(myOc.birth_date)
  const g2 = yearGroup(friendOc.birth_date)
  const gap = g1 != null && g2 != null ? Math.abs(g1 - g2) : 99
  const bothStudents = isStudent(myOc) && isStudent(friendOc)
  const contemporaneous = !bothStudents || gap <= 6
  const sameHouse = bothStudents && myOc.house === friendOc.house
  const sameGrade = bothStudents && gap === 0
  const bothNonStudents = !isStudent(myOc) && !isStudent(friendOc)
  const exactlyOneTeacher = isTeacher(myOc) !== isTeacher(friendOc)

  let pool = contemporaneous ? [...COMMON_POOL, ...FROG_POOL] : []
  if (sameHouse && contemporaneous) {
    pool = pool.concat(HOUSE_POOL)
    pool = pool.concat(HOUSE_SPECIFIC_POOL.filter((item) => item.house === myOc.house))
  }
  if (sameGrade) pool = pool.concat(GRADE_POOL)
  if (bothStudents && gap <= 6) pool = pool.concat(AGE_POOL, STUDENT_POOL, FROG_STUDENT_POOL)
  if (bothNonStudents) pool = pool.concat(TEACHER_POOL, ADULT_POOL)
  if (strangerMode) pool = pool.concat(STRANGER_POOL, FROG_STRANGER_POOL)
  if ((bothStudents && gap <= 6) || exactlyOneTeacher) pool = pool.concat(AGE_OR_TEACHER_POOL)
  pool = pool.filter((item) => !item.excludeIf || !item.excludeIf(myOc, friendOc))
  if (pool.length === 0) pool = COMMON_POOL

  const picked = pickRandom(pool)
  const pick = resolveRandomTokens(picked, t)
  const situationText = pick.text.replace(/〇〇（あなた）/g, myOc.name).replace(/〇〇（お相手）/g, friendOc.name)
  const gachaPick = { place: pick.place, time: pick.time, text: situationText }
  const ageDiffLabel = ageLabel(myOc.birth_date, friendOc.birth_date, t)

  return (
    <div style={{ fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f4eee0', minHeight: '100vh', padding: '24px 20px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center', paddingBottom: 16, borderBottom: '4px double #211d17' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#6b6250' }}>THE UCHIYOSO GAZETTE</div>
        <div style={{ fontSize: 24, color: '#211d17', marginTop: 8, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{strangerMode ? t('知らない人とのマッチング') : t('ランダムマッチング')}</div>
      </div>
      {strangerMode && (
        <div style={{ width: '100%', maxWidth: 360, background: '#fff', border: '1px dashed #8a8168', padding: '9px 12px', marginTop: 14, fontSize: 10.5, color: '#6b6250', lineHeight: 1.8 }}>
          {t('お相手は、同じ世代（生年月日から判定。世代の境目の前後3年は、隣の世代も含みます）のOCから選ばれます。表示名などは、友達になるまで分かりません。中の人チャットで、すり合わせをしてからお話を始められます。')}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 360, border: '4px double #211d17', padding: 18, textAlign: 'center', marginTop: 20, background: '#fff' }}>
        <div style={{ fontSize: 9, color: '#8a8168', letterSpacing: '.1em', marginBottom: 8 }}>{t('🔒 お相手はランダムで決定済み・固定')}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <RandomMatchOcIcon name={myOc.name} iconUrl={myOc.icon_url} house={myOc.house} career={myOc.career} ageDiffLabel={t('あなたです')} />
          <span style={{ fontSize: 11, color: '#8a8168' }}>×</span>
          <RandomMatchOcIcon name={friendOc.name} iconUrl={friendOc.icon_url} house={friendOc.house} career={friendOc.career} ageDiffLabel={ageDiffLabel} />
        </div>
        <div style={{ fontSize: 9.5, color: '#8a8168', marginBottom: 4 }}>{t('アイコンをタップして、お相手の詳細をご確認ください。')}</div>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{myOc.name} × {friendOc.name}</div>
        {strangerMode && (
          <div style={{ marginTop: 10, background: '#f4eee0', border: '1px dashed #8a8168', padding: '7px 10px', fontSize: 11, color: '#6b6250', lineHeight: 1.7 }}>
            <div style={{ fontSize: 9.5, color: '#8a8168' }}>{t('お相手のOCのお相手／夢相手')}</div>
            <div style={{ color: '#211d17', fontWeight: 700 }}>{friendPartners || t('登録なし')}</div>
            <div style={{ fontSize: 9.5, color: '#8a8168', marginTop: 3 }}>{t('文字の相違や言語の違いによって、避けたい相手とマッチングしてしまう可能性があります。被っている場合は、画面を更新して別のお相手を探してください')}</div>
          </div>
        )}
      </div>

      <SituationPicker
        myOcId={myOc.id}
        friendOcId={friendOc.id}
        gachaPick={gachaPick}
        noteExamples={NOTE_EXAMPLES}
        confirmAction={confirmRandomMatch}
        strangerMode={strangerMode}
      />

      <p style={{ fontSize: 10.5, color: '#8a8168', marginTop: 14, textAlign: 'center', fontStyle: 'italic', lineHeight: 1.8 }}>
        {strangerMode ? t('別のお相手を探したい場合は、画面を上にスワイプして更新してください') : t('別の友達を探したい場合は、画面を上にスワイプして更新してください')}
      </p>
      <Link href="/chat" style={{ display: 'block', marginTop: 20, marginBottom: 30, fontSize: 11.5, color: '#6b6250' }}>{t('やっぱりやめる')}</Link>
    </div>
  )
}
