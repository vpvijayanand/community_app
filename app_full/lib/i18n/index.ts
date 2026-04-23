import taJson from "./ta.json"
import enJson from "./en.json"

export type Lang = "ta" | "en"
export type TranslationKeys = typeof taJson

const translations: Record<Lang, TranslationKeys> = {
  ta: taJson,
  en: enJson as unknown as TranslationKeys,
}

/**
 * Get a nested translation value by dot-path.
 * e.g. t("ta", "nav.dashboard") → "முகப்பு"
 */
export function t(lang: Lang, path: string, vars?: Record<string, string | number>): string {
  const keys = path.split(".")
  let result: unknown = translations[lang]
  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = (result as Record<string, unknown>)[k]
    } else {
      return path // fallback: return key path
    }
  }
  if (typeof result !== "string") return path

  // Interpolate {{var}} placeholders
  if (vars) {
    return result.replace(/\{\{(\w+)\}\}/g, (_, key) =>
      vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`
    )
  }
  return result
}

export { taJson, enJson }
