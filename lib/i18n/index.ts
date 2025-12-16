import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'

export type Locale = 'zh-CN' | 'en-US'

export const locales: Record<Locale, any> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export const defaultLocale: Locale = 'zh-CN'

export function getTranslations(locale: Locale = defaultLocale) {
  return locales[locale] || locales[defaultLocale]
}

export function t(key: string, locale: Locale = defaultLocale): string {
  const translations = getTranslations(locale)
  const keys = key.split('.')
  let value: any = translations

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
  }

  return typeof value === 'string' ? value : key
}

// React Hook for i18n
export function useTranslation(locale: Locale = defaultLocale) {
  return {
    t: (key: string) => t(key, locale),
    locale,
  }
}
