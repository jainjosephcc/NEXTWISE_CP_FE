import { createI18n } from 'vue-i18n'
import { cookieRef } from '@layouts/stores/config'
import { themeConfig } from '@themeConfig'

const messages = Object.fromEntries(Object.entries(import.meta.glob('./locales/*.json', { eager: true }))
  .map(([key, value]) => [key.slice(10, -5), value.default]))

let _i18n = null

const customFormatter = {
  interpolate(message, values) {
    // Check if the message is a number or numeric string
    if (typeof message === 'number' || !isNaN(message)) {
      return [message.toString()] // Return the number or numeric string as is
    }

    // Default interpolation for non-numeric values
    return typeof values === 'object'
      ? Object.keys(values).reduce(
        (acc, key) => acc.replace(new RegExp(`{${key}}`, 'g'), values[key]),
        message,
      )
      : message
  },
}

export const getI18n = () => {
  if (_i18n === null) {
    _i18n = createI18n({
      legacy: false,
      locale: cookieRef('language', themeConfig.app.i18n.defaultLocale).value,
      fallbackLocale: 'en',
      messages,
      formatter: customFormatter,
    })
  }

  return _i18n
}

export default function (app) {
  app.use(getI18n())
}

export const safeTranslate = (value) => {
  // If the value is a number or numeric string, return it as a string directly
  if (typeof value === 'number' || !isNaN(value)) {
    return value.toString()
  }

  // For non-numeric values, proceed with translation or return the value as is
  return value
}
