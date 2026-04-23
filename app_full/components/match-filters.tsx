"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const communities = ["Iyer", "Iyengar", "Mudaliar", "Chettiar", "Pillai", "Gounder", "Naidu"]
const diets = ["Vegetarian", "Non-Vegetarian", "Eggetarian"]
const cities = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Bengaluru", "Singapore"]

export type MatchFilterValues = {
  ageRange: [number, number]
  heightRange: [number, number]
  communities: string[]
  diets: string[]
  cities: string[]
  onlyVerified: boolean
}

export const defaultFilters: MatchFilterValues = {
  ageRange: [24, 34],
  heightRange: [150, 190],
  communities: [],
  diets: [],
  cities: [],
  onlyVerified: false,
}

export function MatchFilters({
  value,
  onChange,
}: {
  value: MatchFilterValues
  onChange: (next: MatchFilterValues) => void
}) {
  const [local, setLocal] = useState(value)

  const toggle = (key: "communities" | "diets" | "cities", item: string) => {
    const current = local[key]
    const next = current.includes(item) ? current.filter((c) => c !== item) : [...current, item]
    const updated = { ...local, [key]: next }
    setLocal(updated)
    onChange(updated)
  }

  const update = <K extends keyof MatchFilterValues>(key: K, val: MatchFilterValues[K]) => {
    const updated = { ...local, [key]: val }
    setLocal(updated)
    onChange(updated)
  }

  const reset = () => {
    setLocal(defaultFilters)
    onChange(defaultFilters)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium text-foreground">Refine</h2>
          <p className="font-tamil text-xs text-muted-foreground">வடிகட்டு</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          className="h-auto p-0 text-xs text-muted-foreground hover:bg-transparent hover:text-primary"
        >
          Reset
        </Button>
      </div>

      <Separator />

      {/* Age */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label className="text-sm font-medium text-foreground">Age</Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {local.ageRange[0]} – {local.ageRange[1]} yrs
          </span>
        </div>
        <Slider
          min={21}
          max={45}
          step={1}
          value={local.ageRange}
          onValueChange={(v) => update("ageRange", [v[0], v[1]] as [number, number])}
        />
      </div>

      {/* Height */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label className="text-sm font-medium text-foreground">Height</Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {local.heightRange[0]} – {local.heightRange[1]} cm
          </span>
        </div>
        <Slider
          min={140}
          max={200}
          step={1}
          value={local.heightRange}
          onValueChange={(v) => update("heightRange", [v[0], v[1]] as [number, number])}
        />
      </div>

      <Separator />

      {/* Community */}
      <FilterGroup title="Community" tamil="சமூகம்">
        {communities.map((c) => (
          <CheckboxRow
            key={c}
            id={`community-${c}`}
            label={c}
            checked={local.communities.includes(c)}
            onToggle={() => toggle("communities", c)}
          />
        ))}
      </FilterGroup>

      <Separator />

      {/* Diet */}
      <FilterGroup title="Diet" tamil="உணவு">
        {diets.map((d) => (
          <CheckboxRow
            key={d}
            id={`diet-${d}`}
            label={d}
            checked={local.diets.includes(d)}
            onToggle={() => toggle("diets", d)}
          />
        ))}
      </FilterGroup>

      <Separator />

      {/* City */}
      <FilterGroup title="Location" tamil="இடம்">
        {cities.map((c) => (
          <CheckboxRow
            key={c}
            id={`city-${c}`}
            label={c}
            checked={local.cities.includes(c)}
            onToggle={() => toggle("cities", c)}
          />
        ))}
      </FilterGroup>

      <Separator />

      <CheckboxRow
        id="verified-only"
        label="Verified profiles only"
        checked={local.onlyVerified}
        onToggle={() => update("onlyVerified", !local.onlyVerified)}
      />
    </div>
  )
}

function FilterGroup({
  title,
  tamil,
  children,
}: {
  title: string
  tamil: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <Label className="text-sm font-medium text-foreground">{title}</Label>
        <span className="font-tamil text-xs text-muted-foreground">{tamil}</span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function CheckboxRow({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal text-foreground/90">
        {label}
      </Label>
    </div>
  )
}
