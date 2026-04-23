"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ToggleSwitch } from "./toggle-switch"

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border-light bg-bg-white p-6">
      <header className="mb-3">
        <h3 className="text-[15px] font-semibold text-text-primary">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-text-muted">{subtitle}</p>
        )}
      </header>
      {children}
    </section>
  )
}

export function SettingsTab() {
  const [digest, setDigest] = useState<"never" | "weekly" | "daily">("weekly")
  return (
    <div className="mx-auto max-w-[900px] space-y-5 px-4 pb-12 md:px-8">
      <SectionCard
        title="Feed Settings"
        subtitle="Control how members experience the public news feed."
      >
        <ToggleSwitch title="Show view count publicly" description="Display the number of views on each article card" defaultOn />
        <ToggleSwitch title="Tamil as default display language" description="Show Tamil titles first for all members" defaultOn />
        <ToggleSwitch title="Allow member article sharing" description="Members can share articles to WhatsApp and email" defaultOn />
        <ToggleSwitch title="Enable breaking news ticker" description="A slim saffron ticker below the top navigation" />
        <ToggleSwitch title="Show author name on articles" description="Reveal the contributor’s name on each piece" defaultOn last />
      </SectionCard>

      <SectionCard
        title="Approval Workflow"
        subtitle="Who publishes — and how."
      >
        <ToggleSwitch
          title="Require admin approval before publishing"
          description="All articles enter a review queue first"
          defaultOn
        />
        <div className="flex items-center justify-between gap-4 py-4 border-b border-border-light">
          <div>
            <div className="text-sm font-medium text-text-primary">
              Default language for new articles
            </div>
            <div className="mt-0.5 text-[12px] text-text-muted">
              Pre-selected in the Create form
            </div>
          </div>
          <select className="h-10 rounded-lg border-[1.5px] border-border-light bg-bg-page px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
            <option>Tamil (தமிழ்)</option>
            <option>English</option>
            <option>Bilingual</option>
          </select>
        </div>
        <ToggleSwitch
          title="Notify admin on new submissions"
          description="Send an email whenever a new draft is created"
          defaultOn
          last
        />
      </SectionCard>

      <SectionCard
        title="Notification Settings"
        subtitle="How we keep members in the loop."
      >
        <ToggleSwitch
          title="Push notifications for featured articles"
          description="Only featured articles push a device notification"
          defaultOn
        />
        <div className="pt-4">
          <div className="mb-2 text-sm font-medium text-text-primary">
            Email digest frequency
          </div>
          <div className="inline-flex rounded-lg border border-border-light bg-bg-subtle p-1">
            {(["never", "weekly", "daily"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setDigest(k)}
                className={cn(
                  "h-9 rounded-md px-4 text-[13px] font-medium capitalize transition-colors",
                  digest === k
                    ? "bg-bg-white text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary",
                )}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
