"use client"

import type { UserState } from "@/lib/navigation-priority"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

const FIELDS: Array<{
  key: keyof UserState
  label: string
  group: "Account" | "Profile" | "Engagement"
}> = [
  { key: "isEmailVerified", label: "Email verified", group: "Account" },
  { key: "isPhoneVerified", label: "Phone verified", group: "Account" },
  { key: "hasBasicProfile", label: "Basic profile filled", group: "Profile" },
  { key: "hasPhoto", label: "Profile photo uploaded", group: "Profile" },
  { key: "hasHoroscope", label: "Horoscope added", group: "Profile" },
  { key: "hasPreferences", label: "Partner preferences set", group: "Profile" },
  { key: "hasBrowsedMatches", label: "Has browsed matches", group: "Engagement" },
  { key: "hasSentFirstInterest", label: "Sent first interest", group: "Engagement" },
]

const GROUPS = ["Account", "Profile", "Engagement"] as const

export function SimulatorStatePanel({
  state,
  onChange,
  onReset,
}: {
  state: UserState
  onChange: (next: UserState) => void
  onReset: () => void
}) {
  const update = (key: keyof UserState, value: boolean) => {
    onChange({ ...state, [key]: value })
  }

  return (
    <aside
      aria-label="Simulator state"
      className="rounded-3xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-medium text-foreground">
            User state
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Toggle flags to see the resolver re-rank.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs text-muted-foreground hover:bg-secondary"
        >
          Reset
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-6">
        {GROUPS.map((group) => (
          <div key={group}>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {group}
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {FIELDS.filter((f) => f.group === group).map((field) => (
                <li
                  key={field.key}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-2.5"
                >
                  <Label
                    htmlFor={`state-${field.key}`}
                    className="text-sm font-normal text-foreground"
                  >
                    {field.label}
                  </Label>
                  <Switch
                    id={`state-${field.key}`}
                    checked={Boolean(state[field.key])}
                    onCheckedChange={(checked) => update(field.key, checked)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}
