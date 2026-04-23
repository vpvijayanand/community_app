"use client"

import { useFormContext } from "react-hook-form"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function cmToFtIn(cm: number) {
  const totalInches = cm / 2.54
  const ft = Math.floor(totalInches / 12)
  const inch = Math.round(totalInches % 12)
  return `${ft}' ${inch}"`
}

const COMPLEXIONS = [
  { value: "fair", label: "Fair", tamil: "வெண்மை" },
  { value: "wheatish", label: "Wheatish", tamil: "கோதுமை" },
  { value: "dark", label: "Dark", tamil: "கரு" },
]
const FOOD_PREFS = [
  { value: "vegetarian", label: "Vegetarian", tamil: "சைவம்" },
  { value: "non_vegetarian", label: "Non-Vegetarian", tamil: "அசைவம்" },
  { value: "eggetarian", label: "Eggetarian", tamil: "முட்டைசாப்பிடுவோர்" },
]
const BODY_TYPES = ["Slim", "Athletic", "Average", "Heavy"]

export function PhysicalDetailsStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
  const height = watch("height") || 165
  const complexion = watch("complexion")
  const foodPreference = watch("foodPreference")

  return (
    <div className="space-y-8">
      {/* Height Slider */}
      <Field>
        <div className="flex items-baseline justify-between">
          <FieldLabel>உயரம் <span className="text-muted-foreground text-xs ml-1">Height</span></FieldLabel>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-primary">{height} cm</span>
            <span className="text-muted-foreground text-sm">/ {cmToFtIn(height)}</span>
          </div>
        </div>
        <input
          type="range"
          min={140}
          max={200}
          step={1}
          value={height}
          onChange={(e) => setValue("height", parseInt(e.target.value), { shouldValidate: true })}
          className="w-full accent-primary h-2 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>140 cm</span>
          <span>200 cm</span>
        </div>
        {errors.height && <p className="text-xs text-destructive mt-1 font-tamil">{errors.height.message as string}</p>}
      </Field>

      {/* Weight */}
      <Field>
        <FieldLabel>எடை <span className="text-muted-foreground text-xs ml-1">Weight (kg)</span></FieldLabel>
        <Input type="number" min={30} max={150} {...register("weight", { valueAsNumber: true })} placeholder="70" className="w-32" />
        {errors.weight && <p className="text-xs text-destructive mt-1 font-tamil">{errors.weight.message as string}</p>}
      </Field>

      {/* Complexion */}
      <Field>
        <FieldLabel>நிறம் <span className="text-muted-foreground text-xs ml-1">Complexion</span></FieldLabel>
        <div className="flex flex-wrap gap-3">
          {COMPLEXIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("complexion", opt.value, { shouldValidate: true })}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-5 py-3 text-sm transition-all",
                complexion === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground/80 hover:bg-secondary"
              )}
            >
              <span className="font-semibold">{opt.label}</span>
              <span className="font-tamil text-xs text-muted-foreground">{opt.tamil}</span>
            </button>
          ))}
        </div>
        {errors.complexion && <p className="text-xs text-destructive mt-1 font-tamil">{errors.complexion.message as string}</p>}
      </Field>

      {/* Food Preference */}
      <Field>
        <FieldLabel>உணவு விருப்பம் <span className="text-muted-foreground text-xs ml-1">Food Preference</span></FieldLabel>
        <div className="flex flex-wrap gap-3">
          {FOOD_PREFS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("foodPreference", opt.value, { shouldValidate: true })}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl border px-5 py-3 text-sm transition-all",
                foodPreference === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground/80 hover:bg-secondary"
              )}
            >
              <span className="font-semibold">{opt.label}</span>
              <span className="font-tamil text-xs text-muted-foreground">{opt.tamil}</span>
            </button>
          ))}
        </div>
        {errors.foodPreference && <p className="text-xs text-destructive mt-1 font-tamil">{errors.foodPreference.message as string}</p>}
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Body Type */}
        <Field>
          <FieldLabel>உடல் வகை <span className="text-muted-foreground text-xs ml-1">Body Type</span></FieldLabel>
          <select {...register("bodyType")} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">தேர்ந்தெடுக்கவும்</option>
            {BODY_TYPES.map((b) => <option key={b} value={b.toLowerCase()}>{b}</option>)}
          </select>
          {errors.bodyType && <p className="text-xs text-destructive mt-1 font-tamil">{errors.bodyType.message as string}</p>}
        </Field>

        {/* Physical Disability */}
        <Field>
          <FieldLabel>உடல் குறைபாடு <span className="text-muted-foreground text-xs ml-1">Physical Disability (Optional)</span></FieldLabel>
          <Input {...register("physicalDisability")} placeholder="ஏதாவது இருந்தால் குறிப்பிடவும்" />
        </Field>
      </div>
    </div>
  )
}
