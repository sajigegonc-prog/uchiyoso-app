import { cookies, headers } from 'next/headers'
import { LOCALE_COOKIE, localeFromAcceptLanguage, normalizeLocale, translate } from './translate'

// 1) 切り替えボタンで保存されたCookie → 2) ブラウザの言語設定 の順で決める
export function getLocale() {
  const saved = normalizeLocale(cookies().get(LOCALE_COOKIE)?.value)
  if (saved) return saved
  return localeFromAcceptLanguage(headers().get('accept-language'))
}

// サーバーコンポーネント・サーバーアクション用:  const t = getT()
export function getT() {
  const locale = getLocale()
  const t = (ja, vars) => translate(locale, ja, vars)
  t.locale = locale
  return t
}
