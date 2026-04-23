"use client"

import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react"
import type { Lang } from "@/lib/i18n"
import { t as translate } from "@/lib/i18n"

type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (path: string, vars?: Record<string, string | number>) => string
}

const LangContext = createContext<LangContextValue>({
  lang: "ta",
  setLang: () => {},
  t: (path) => path,
})

export function useLang() {
  return useContext(LangContext)
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ta")

  useEffect(() => {
    const saved = localStorage.getItem("maratha-lang") as Lang | null
    if (saved === "ta" || saved === "en") setLangState(saved)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem("maratha-lang", l)
    document.documentElement.lang = l
  }, [])

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => translate(lang, path, vars),
    [lang],
  )

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}
