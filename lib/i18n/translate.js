// 日本語の原文をキーにして翻訳を引く共通関数（サーバー・クライアント両方で使えます）
import { dict } from './dict'

export const LOCALES = ['ja', 'en', 'ko']
export const LOCALE_COOKIE = 'lang'

export function normalizeLocale(value) {
  const v = (value || '').toString().toLowerCase()
  if (v.startsWith('ja')) return 'ja'
  if (v.startsWith('ko')) return 'ko'
  if (v.startsWith('en')) return 'en'
  return null
}

// Accept-Language ヘッダーから最初に見つかった対応言語を返す。対応外なら英語。
export function localeFromAcceptLanguage(header) {
  const parts = (header || '').split(',')
  for (const part of parts) {
    const found = normalizeLocale(part.trim().split(';')[0])
    if (found) return found
  }
  return 'en'
}

// ja: 日本語の原文（{name} のような差し込みOK）
// vars: 差し込みの値  例 t('{name}として発言', { name })
export function translate(locale, ja, vars) {
  let text = ja
  if (locale !== 'ja') {
    const table = dict[locale]
    if (table && Object.prototype.hasOwnProperty.call(table, ja)) text = table[ja]
  }
  if (vars) {
    text = text.replace(/\{(\w+)\}/g, (m, key) => (vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : m))
  }
  return text
}
