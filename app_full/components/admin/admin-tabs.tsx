"use client"

import { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"
import { CreateArticleForm } from "./create-article-form"
import { ManageArticles } from "./manage-articles"
import { SettingsTab } from "./settings-tab"
import { ScheduledTab } from "./scheduled-tab"
import { useArticleCounts } from "@/lib/news-store"

const TABS = [
  { key: "create", label: "Create New" },
  { key: "manage", label: "Manage Articles" },
  { key: "scheduled", label: "Scheduled" },
  { key: "settings", label: "Settings" },
] as const

export type TabKey = (typeof TABS)[number]["key"]

const TabNavContext = createContext<(tab: TabKey) => void>(() => {})
export function useTabNav() {
  return useContext(TabNavContext)
}

export function AdminTabs() {
  const [active, setActive] = useState<TabKey>("create")
  const counts = useArticleCounts()

  const badgeFor = (key: TabKey): number | null => {
    if (key === "manage") return counts.total || null
    if (key === "scheduled") return counts.scheduled || null
    return null
  }

  return (
    <TabNavContext.Provider value={setActive}>
      <div className="px-4 pb-5 md:px-8">
        <div className="inline-flex flex-wrap rounded-lg border border-border-light bg-bg-subtle p-1.5">
          {TABS.map((t) => {
            const isActive = active === t.key
            const badge = badgeFor(t.key)
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActive(t.key)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md px-4 text-[13px] font-medium transition-all",
                  isActive
                    ? "bg-bg-white text-primary font-semibold shadow-sm"
                    : "text-text-muted hover:text-text-primary",
                )}
              >
                {t.label}
                {badge !== null && (
                  <span
                    className={cn(
                      "inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-bg-white text-text-secondary",
                    )}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {active === "create" && <CreateArticleForm />}
      {active === "manage" && <ManageArticles />}
      {active === "scheduled" && <ScheduledTab />}
      {active === "settings" && <SettingsTab />}
    </TabNavContext.Provider>
  )
}
