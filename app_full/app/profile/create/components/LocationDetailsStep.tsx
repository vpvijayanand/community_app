"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const STATES = [
  "Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana",
  "Maharashtra", "Delhi", "Gujarat", "Rajasthan", "Uttar Pradesh",
  "West Bengal", "Madhya Pradesh", "Bihar", "Odisha", "Punjab",
  "Haryana", "Jharkhand", "Assam", "Chhattisgarh", "Other"
]

const RELOCATION_OPTS = [
  { value: "yes", label: "ஆம் (Yes)" },
  { value: "no", label: "இல்லை (No)" },
  { value: "open", label: "பார்க்கலாம் (Open)" },
]

export function LocationDetailsStep() {
  const { register, control, setValue, formState: { errors } } = useFormContext()
  const country = useWatch({ control, name: "country" }) || "India"
  const relocation = useWatch({ control, name: "willingToRelocate" }) as string

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field>
          <FieldLabel>நாடு <span className="text-muted-foreground text-xs ml-1">Country</span></FieldLabel>
          <select {...register("country")} defaultValue="India" className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="India">India 🇮🇳</option>
            <option value="USA">United States 🇺🇸</option>
            <option value="UK">United Kingdom 🇬🇧</option>
            <option value="UAE">UAE 🇦🇪</option>
            <option value="Canada">Canada 🇨🇦</option>
            <option value="Singapore">Singapore 🇸🇬</option>
            <option value="Australia">Australia 🇦🇺</option>
          </select>
        </Field>

        <Field>
          <FieldLabel>மாநிலம் <span className="text-muted-foreground text-xs ml-1">State</span></FieldLabel>
          <select {...register("state")} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">தேர்ந்தெடுக்கவும்</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p className="text-xs text-destructive mt-1 font-tamil">{errors.state.message as string}</p>}
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field>
          <FieldLabel>நகரம் <span className="text-muted-foreground text-xs ml-1">City</span></FieldLabel>
          <Input {...register("city")} placeholder="உ.ம்., Chennai" list="city-suggestions" />
          <datalist id="city-suggestions">
            {["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Erode", "Vellore"].map(c => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {errors.city && <p className="text-xs text-destructive mt-1 font-tamil">{errors.city.message as string}</p>}
        </Field>

        <Field>
          <FieldLabel>பகுதி <span className="text-muted-foreground text-xs ml-1">Area (Optional)</span></FieldLabel>
          <Input {...register("area")} placeholder="உ.ம்., Anna Nagar" />
        </Field>
      </div>

      <Field>
        <FieldLabel>சொந்த ஊர் <span className="text-muted-foreground text-xs ml-1">Native Place (Optional)</span></FieldLabel>
        <Input {...register("nativePlace")} placeholder="உ.ம்., Thanjavur" />
      </Field>

      <Field>
        <FieldLabel>இடம் மாற விருப்பம் <span className="text-muted-foreground text-xs ml-1">Willing to Relocate</span></FieldLabel>
        <div className="flex flex-wrap gap-3">
          {RELOCATION_OPTS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setValue("willingToRelocate", o.value, { shouldValidate: true })}
              className={cn(
                "rounded-xl border px-5 py-3 text-sm font-tamil transition-all",
                relocation === o.value
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "border-border bg-background hover:bg-secondary text-foreground/80"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        {errors.willingToRelocate && <p className="text-xs text-destructive mt-1 font-tamil">{errors.willingToRelocate.message as string}</p>}
      </Field>
    </div>
  )
}
