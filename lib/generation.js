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
