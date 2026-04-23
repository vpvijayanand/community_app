"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const EMP_TYPES = ["Salaried", "Business", "Self-Employed", "Student", "Not Working"]
const INCOME_RANGES = [
  { value: "lt2l", label: "< ₹2 Lakhs" },
  { value: "2_5l", label: "₹2 – 5 Lakhs" },
  { value: "5_10l", label: "₹5 – 10 Lakhs" },
  { value: "10_20l", label: "₹10 – 20 Lakhs" },
  { value: "20_50l", label: "₹20 – 50 Lakhs" },
  { value: "gt50l", label: "> ₹50 Lakhs" },
]

export function CareerDetailsStep() {
  const { register, control, formState: { errors } } = useFormContext()
  const employmentType = useWatch({ control, name: "employmentType" }) as string | undefined
  const showCompany = employmentType && !["Student", "Not Working"].includes(employmentType)

  return (
    <div className="space-y-6">
      <Field>
        <FieldLabel>வேலைவாய்ப்பு வகை <span className="text-muted-foreground text-xs ml-1">Employment Type</span></FieldLabel>
        <div className="flex flex-wrap gap-2">
          {EMP_TYPES.map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-center justify-center rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary"
            >
              <input type="radio" value={t} {...register("employmentType")} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
        {errors.employmentType && <p className="text-xs text-destructive mt-1">{errors.employmentType.message as string}</p>}
      </Field>

      {showCompany && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
          <Field>
            <FieldLabel>நிறுவனம் <span className="text-muted-foreground text-xs ml-1">Company Name</span></FieldLabel>
            <Input {...register("companyName")} placeholder="உ.ம்., Zoho Corp" />
          </Field>
          <Field>
            <FieldLabel>பதவி <span className="text-muted-foreground text-xs ml-1">Designation</span></FieldLabel>
            <Input {...register("designation")} placeholder="உ.ம்., Software Engineer" />
          </Field>
        </div>
      )}

      <Field>
        <FieldLabel>பணியிடம் <span className="text-muted-foreground text-xs ml-1">Work Location</span></FieldLabel>
        <Input {...register("workLocation")} placeholder="உ.ம்., Chennai" />
      </Field>

      <Field>
        <FieldLabel>வருடாந்திர வருமானம் <span className="text-muted-foreground text-xs ml-1">Annual Income</span></FieldLabel>
        <select {...register("annualIncome")} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">தேர்ந்தெடுக்கவும்</option>
          {INCOME_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        {errors.annualIncome && <p className="text-xs text-destructive mt-1">{errors.annualIncome.message as string}</p>}
      </Field>
    </div>
  )
}
