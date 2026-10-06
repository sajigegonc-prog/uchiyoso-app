// 各担当ファイルの辞書を合体させます。グループ名のファイルを追加したらここにも1行足してください。
import common from './common'
import chatRoom from './chatRoom'
import chatRoomOoc from './chatRoomOoc'
import chatList from './chatList'
import chatNew from './chatNew'
import chatRandom from './chatRandom'
import situation from './situation'
import ocs from './ocs'
import onboarding from './onboarding'
import owlFriends from './owlFriends'
import misc from './misc'
import strangerMatch from './strangerMatch'

const parts = [common, chatRoom, chatRoomOoc, chatList, chatNew, chatRandom, situation, ocs, onboarding, owlFriends, misc, strangerMatch]

export const dict = { en: {}, ko: {} }
for (const p of parts) {
  Object.assign(dict.en, p.en)
  Object.assign(dict.ko, p.ko)
}
