'use client'
import { createContext, useContext } from 'react'
import { translate } from './translate'

const LocaleContext = createContext('ja')

export function I18nProvider({ locale, children }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}

// クライアントコンポーネント用:  const t = useT()
export function useT() {
  const locale = useContext(LocaleContext)
  const t = (ja, vars) => translate(locale, ja, vars)
  t.locale = locale
  return t
}
