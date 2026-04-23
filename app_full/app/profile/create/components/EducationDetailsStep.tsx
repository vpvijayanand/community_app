"use client"

import { useFormContext } from "react-hook-form"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const QUALIFICATIONS = ["10th", "12th", "Diploma", "UG (B.E/B.Sc/B.Com)", "PG (M.E/M.Sc/MBA)", "PhD", "Other"]
const currentYear = new Date().getFullYear()

export function EducationDetailsStep() {
  const { register, formState: { errors } } = useFormContext()
  return (
    <div className="space-y-6">
      <Field>
        <FieldLabel>கல்வி தகுதி <span className="text-muted-foreground text-xs ml-1">Qualification</span></FieldLabel>
        <select {...register("qualification")} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">தேர்ந்தெடுக்கவும்</option>
          {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
        </select>
        {errors.qualification && <p className="text-xs text-destructive mt-1 font-tamil">{errors.qualification.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel>படிப்பு துறை <span className="text-muted-foreground text-xs ml-1">Field of Study</span></FieldLabel>
        <Input {...register("fieldOfStudy")} placeholder="உ.ம்., Computer Science" />
        {errors.fieldOfStudy && <p className="text-xs text-destructive mt-1 font-tamil">{errors.fieldOfStudy.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel>கல்வி நிறுவனம் <span className="text-muted-foreground text-xs ml-1">Institution</span></FieldLabel>
        <Input {...register("institution")} placeholder="உ.ம்., Anna University" />
        {errors.institution && <p className="text-xs text-destructive mt-1 font-tamil">{errors.institution.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel>முடித்த ஆண்டு <span className="text-muted-foreground text-xs ml-1">Graduation Year</span></FieldLabel>
        <Input 
          type="number" 
          min={1970} 
          max={currentYear} 
          {...register("graduationYear", { valueAsNumber: true })} 
          placeholder={String(currentYear - 3)}
          className="w-36"
        />
        {errors.graduationYear && <p className="text-xs text-destructive mt-1 font-tamil">{errors.graduationYear.message as string}</p>}
      </Field>
    </div>
  )
}
