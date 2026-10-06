// OCの「世代」を生年から決める（知らない人とのマッチで、同じ世代の人だけを出すために使う）
// 0=生年月日が未入力 / 1=爺世代 / 2=親世代 / 3=子世代 / 4=魔法の覚醒世代 / 5=孫世代
export function generationOf(birthDate) {
  if (!birthDate) return 0
  const y = new Date(birthDate).getFullYear()
  if (Number.isNaN(y)) return 0
  if (y <= 1949) return 1
  if (y <= 1969) return 2
  if (y <= 1989) return 3
  if (y <= 1999) return 4
  return 5
}

// 世代の境目（この年から次の世代）
const BOUNDARIES = [1950, 1970, 1990, 2000]
const NEAR_YEARS = 3

// 同じ世代、または世代の境目の前後3年どうしなら、マッチしてよい
// 例：1987〜1989年生まれ（子世代の終わり）と、1990〜1992年生まれ（覚醒世代の始まり）
export function generationsCompatible(birthA, birthB) {
  const ga = generationOf(birthA)
  const gb = generationOf(birthB)
  if (ga === 0 || gb === 0) return ga === gb
  if (ga === gb) return true
  if (Math.abs(ga - gb) !== 1) return false
  const early = ga < gb ? birthA : birthB
  const late = ga < gb ? birthB : birthA
  const boundary = BOUNDARIES[Math.min(ga, gb) - 1]
  const earlyYear = new Date(early).getFullYear()
  const lateYear = new Date(late).getFullYear()
  return boundary - earlyYear <= NEAR_YEARS && lateYear - boundary < NEAR_YEARS
}
