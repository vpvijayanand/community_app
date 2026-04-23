"use client"

import { useFormContext } from "react-hook-form"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const MARITAL_OPTIONS = [
  { value: "never_married", label: "திருமணமாகாதவர்" },
  { value: "divorced", label: "விவாகரத்து" },
  { value: "widowed", label: "கணவன்/மனைவி இறந்தவர்" },
]
const TONGUE_OPTIONS = ["Tamil", "Telugu", "Kannada", "Malayalam", "Hindi", "Other"]
const RELIGION_OPTIONS = ["Hindu", "Christian", "Muslim", "Jain", "Other"]

export function BasicDetailsStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
  const gender = watch("gender")

  return (
    <div className="space-y-6">
      <Field>
        <FieldLabel>முழு பெயர் <span className="text-muted-foreground text-xs ml-1">Full Name</span></FieldLabel>
        <Input {...register("fullName")} placeholder="உ.ம்., சூர்யா நாராயணன்" />
        {errors.fullName && <p className="text-xs text-destructive mt-1 font-tamil">{errors.fullName.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel>பாலினம் <span className="text-muted-foreground text-xs ml-1">Gender</span></FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          {[{ value: "male", label: "ஆண்" }, { value: "female", label: "பெண்" }].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("gender", opt.value, { shouldValidate: true })}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-tamil font-semibold transition-all",
                gender === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground/80 hover:bg-secondary"
              )}
            >
              <span className="text-lg">{opt.value === "male" ? "♂" : "♀"}</span>
              {opt.label}
            </button>
          ))}
        </div>
        {errors.gender && <p className="text-xs text-destructive mt-1 font-tamil">{errors.gender.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel>பிறந்த தேதி <span className="text-muted-foreground text-xs ml-1">Date of Birth</span></FieldLabel>
        <Input type="date" {...register("dateOfBirth")} max={new Date(Date.now() - 18*365.25*24*60*60*1000).toISOString().split("T")[0]} />
        {errors.dateOfBirth && <p className="text-xs text-destructive mt-1 font-tamil">{errors.dateOfBirth.message as string}</p>}
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field>
          <FieldLabel>திருமண நிலை <span className="text-muted-foreground text-xs ml-1">Marital Status</span></FieldLabel>
          <select {...register("maritalStatus")} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-tamil ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">தேர்ந்தெடுக்கவும்</option>
            {MARITAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.maritalStatus && <p className="text-xs text-destructive mt-1 font-tamil">{errors.maritalStatus.message as string}</p>}
        </Field>
        <Field>
          <FieldLabel>தாய்மொழி <span className="text-muted-foreground text-xs ml-1">Mother Tongue</span></FieldLabel>
          <select {...register("motherTongue")} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">தேர்ந்தெடுக்கவும்</option>
            {TONGUE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {errors.motherTongue && <p className="text-xs text-destructive mt-1 font-tamil">{errors.motherTongue.message as string}</p>}
        </Field>
      </div>

      <Field>
        <FieldLabel>மதம் <span className="text-muted-foreground text-xs ml-1">Religion</span></FieldLabel>
        <select {...register("religion")} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">தேர்ந்தெடுக்கவும்</option>
          {RELIGION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {errors.religion && <p className="text-xs text-destructive mt-1 font-tamil">{errors.religion.message as string}</p>}
      </Field>
    </div>
  )
}
