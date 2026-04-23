"use client"

import { useFormContext, useFieldArray } from "react-hook-form"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const MARITAL_OPTS = ["திருமணமாகாதவர்", "திருமணமானவர்", "விவாகரத்து"]

function RadioRow({
  label, value, options, onChange, error
}: { label: string; value: string; options: {v:string;l:string}[]; onChange: (v:string)=>void; error?: string }) {
  return (
    <Field>
      <FieldLabel className="font-tamil">{label}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((opt)=>(
          <button key={opt.v} type="button" onClick={()=>onChange(opt.v)}
            className={cn("rounded-xl border px-4 py-2.5 text-sm font-tamil transition-all",
              value===opt.v?"border-primary bg-primary/10 text-primary":"border-border bg-background hover:bg-secondary"
            )}>
            {opt.l}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-destructive mt-1 font-tamil">{error}</p>}
    </Field>
  )
}

export function FamilyDetailsStep() {
  const { register, watch, setValue, control, formState: { errors } } = useFormContext()
  const familyType = watch("familyType") as string
  const familyStatus = watch("familyStatus") as string
  const familyValues = watch("familyValues") as string
  const fatherAlive = watch("fatherAlive") as boolean
  const motherAlive = watch("motherAlive") as boolean

  const { fields, append, remove } = useFieldArray({ control, name: "siblings" })

  return (
    <div className="space-y-8">
      <RadioRow
        label="குடும்ப வகை / Family Type"
        value={familyType}
        options={[{v:"joint",l:"கூட்டுக்குடும்பம் (Joint)"},{v:"nuclear",l:"தனிக்குடும்பம் (Nuclear)"}]}
        onChange={(v)=>setValue("familyType", v, {shouldValidate:true})}
        error={errors.familyType?.message as string}
      />

      {/* Parents */}
      <div className="rounded-xl border border-border p-5 space-y-5">
        <h3 className="font-semibold text-foreground font-tamil">பெற்றோர் விவரங்கள் / Parents</h3>
        
        {/* Father */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground/80 font-tamil w-16">தந்தை</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register("fatherAlive")} className="h-4 w-4 rounded border-border accent-primary" />
              <span className="text-xs text-muted-foreground">உயிரோடு இருக்கிறார்</span>
            </label>
          </div>
          {fatherAlive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 animate-in fade-in slide-in-from-top-1">
              <Input {...register("fatherName")} placeholder="தந்தை பெயர்" />
              <Input {...register("fatherOccupation")} placeholder="தொழில்" />
            </div>
          )}
        </div>

        {/* Mother */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground/80 font-tamil w-16">தாயார்</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register("motherAlive")} className="h-4 w-4 rounded border-border accent-primary" />
              <span className="text-xs text-muted-foreground">உயிரோடு இருக்கிறார்</span>
            </label>
          </div>
          {motherAlive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
              <Input {...register("motherName")} placeholder="தாயார் பெயர்" />
              <Input {...register("motherOccupation")} placeholder="தொழில்" />
            </div>
          )}
        </div>
      </div>

      {/* Siblings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FieldLabel className="font-tamil">சகோதரர்கள் / Siblings</FieldLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", gender: "", maritalStatus: "", occupation: "" })}
            className="gap-2 text-xs"
          >
            <PlusCircle className="h-4 w-4" /> சேர்க்க
          </Button>
        </div>
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 animate-in fade-in slide-in-from-left-2">
              <div className="grid flex-1 grid-cols-2 sm:grid-cols-4 gap-3">
                <Input {...register(`siblings.${idx}.name`)} placeholder="பெயர்" />
                <select {...register(`siblings.${idx}.gender`)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">பாலினம்</option>
                  <option value="male">ஆண்</option>
                  <option value="female">பெண்</option>
                </select>
                <select {...register(`siblings.${idx}.maritalStatus`)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-tamil">
                  <option value="">நிலை</option>
                  {MARITAL_OPTS.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
                <Input {...register(`siblings.${idx}.occupation`)} placeholder="தொழில்" />
              </div>
              <button type="button" onClick={() => remove(idx)} className="mt-2 text-destructive hover:text-destructive/80 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <RadioRow
        label="குடும்ப நிலை / Family Status"
        value={familyStatus}
        options={[{v:"middle",l:"நடுத்தர வர்க்கம்"},{v:"upper_middle",l:"உயர் நடுத்தர"},{v:"affluent",l:"வசதியான"}]}
        onChange={(v)=>setValue("familyStatus",v,{shouldValidate:true})}
        error={errors.familyStatus?.message as string}
      />
      <RadioRow
        label="குடும்ப மதிப்புகள் / Family Values"
        value={familyValues}
        options={[{v:"orthodox",l:"பாரம்பரிய"},{v:"moderate",l:"மிதவாதி"},{v:"liberal",l:"தாராளமான"}]}
        onChange={(v)=>setValue("familyValues",v,{shouldValidate:true})}
        error={errors.familyValues?.message as string}
      />
    </div>
  )
}
