"use client"

import { useFormContext } from "react-hook-form"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

type Props = {
  lang?: "ta" | "en"
}

const COMPLEXION_OPTS = [
  { value: "fair", ta: "வெண்மை", en: "Fair" },
  { value: "wheatish", ta: "கோதுமை", en: "Wheatish" },
  { value: "dark", ta: "கரு", en: "Dark" },
  { value: "any", ta: "எந்த நிறமும்", en: "Any" },
]

const FOOD_OPTS = [
  { value: "vegetarian", ta: "சைவம்", en: "Vegetarian" },
  { value: "non_vegetarian", ta: "அசைவம்", en: "Non-Veg" },
  { value: "eggetarian", ta: "முட்டை", en: "Eggetarian" },
]

const INCOME_OPTS = [
  { value: "any", ta: "எதுவும் சரி", en: "Any" },
  { value: "3l+", ta: "₹3L+", en: "₹3L+" },
  { value: "5l+", ta: "₹5L+", en: "₹5L+" },
  { value: "10l+", ta: "₹10L+", en: "₹10L+" },
  { value: "20l+", ta: "₹20L+", en: "₹20L+" },
]

const EDU_OPTS = [
  { value: "any", ta: "எதுவும் சரி", en: "Any" },
  { value: "graduate", ta: "பட்டதாரி", en: "Graduate" },
  { value: "post_graduate", ta: "முதுகலை", en: "Post Graduate" },
  { value: "phd", ta: "முனைவர்", en: "Ph.D" },
]

const EMP_PREF_OPTS = [
  { value: "salaried", ta: "சம்பளம்", en: "Salaried" },
  { value: "business", ta: "வியாபாரம்", en: "Business" },
  { value: "self_employed", ta: "சுயதொழில்", en: "Self-Employed" },
  { value: "any", ta: "எதுவும் சரி", en: "Any" },
]

const STATE_PREF_OPTS = [
  { value: "tamil_nadu", ta: "தமிழ்நாடு", en: "Tamil Nadu" },
  { value: "kerala", ta: "கேரளா", en: "Kerala" },
  { value: "karnataka", ta: "கர்நாடகா", en: "Karnataka" },
  { value: "andhra_pradesh", ta: "ஆந்திரா", en: "Andhra Pradesh" },
  { value: "telangana", ta: "தெலங்கானா", en: "Telangana" },
  { value: "maharashtra", ta: "மஹாராஷ்டிரா", en: "Maharashtra" },
  { value: "delhi", ta: "டெல்லி", en: "Delhi" },
  { value: "any", ta: "எந்த மாநிலமும்", en: "Any State" },
]

function MultiSelect({
  name,
  options,
  lang,
}: {
  name: string
  options: { value: string; ta: string; en: string }[]
  lang: "ta" | "en"
}) {
  const { watch, setValue } = useFormContext()
  const selected: string[] = watch(name) ?? []

  const toggle = (val: string) => {
    const updated = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val]
    setValue(name, updated, { shouldValidate: true })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={[
            "rounded-xl border px-4 py-2.5 text-sm font-tamil transition-all",
            selected.includes(opt.value)
              ? "border-primary bg-primary/10 text-primary font-semibold"
              : "border-border bg-background text-foreground/80 hover:bg-secondary",
          ].join(" ")}
        >
          {opt.en} {opt.en !== opt.ta && <span className="font-tamil ml-1 opacity-70 text-xs">{opt.ta}</span>}
        </button>
      ))}
    </div>
  )
}

export function ExpectationsStep({ lang = "ta" }: Props) {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
  const ageMin = watch("ageRangeMin")
  const ageMax = watch("ageRangeMax")
  const heightMin = watch("heightRangeMin")
  const heightMax = watch("heightRangeMax")

  return (
    <div className="space-y-8">
      {/* Age Range */}
      <Field>
        <FieldLabel>
          {lang === "ta" ? "வயது வரம்பு" : "Expected Age Range"}{" "}
          <span className="text-muted-foreground text-xs ml-1">
            {lang === "ta" ? "Age Range" : "வயது வரம்பு"}
          </span>
        </FieldLabel>
        <div className="flex flex-col gap-4 mt-2 px-2">
          <Slider
            min={18}
            max={70}
            step={1}
            value={[ageMin || 18, ageMax || 70]}
            onValueChange={([min, max]) => {
              setValue("ageRangeMin", min, { shouldValidate: true })
              setValue("ageRangeMax", max, { shouldValidate: true })
            }}
          />
          <div className="flex justify-between items-center text-sm font-semibold text-primary">
            <span>{ageMin || 18} {lang === "ta" ? "முதல்" : "min"}</span>
            <span>{ageMax || 70} {lang === "ta" ? "வயது வரை" : "max yrs"}</span>
          </div>
        </div>
        {errors.ageRangeMin && (
          <p className="text-xs text-destructive mt-1 font-tamil">
            {errors.ageRangeMin.message as string}
          </p>
        )}
      </Field>

      {/* Height Range */}
      <Field>
        <FieldLabel>
          {lang === "ta" ? "உயர வரம்பு (செ.மீ.)" : "Expected Height Range (cm)"}
        </FieldLabel>
        <div className="flex flex-col gap-4 mt-2 px-2">
          <Slider
            min={140}
            max={200}
            step={1}
            value={[heightMin || 140, heightMax || 200]}
            onValueChange={([min, max]) => {
              setValue("heightRangeMin", min, { shouldValidate: true })
              setValue("heightRangeMax", max, { shouldValidate: true })
            }}
          />
          <div className="flex justify-between items-center text-sm font-semibold text-primary">
            <span>{heightMin || 140} cm</span>
            <span>{heightMax || 200} cm</span>
          </div>
        </div>
      </Field>

      {/* Complexion Preference */}
      <Field>
        <FieldLabel>
          {lang === "ta" ? "நிற விருப்பம்" : "Complexion Preference"}
        </FieldLabel>
        <MultiSelect name="complexionPref" options={COMPLEXION_OPTS} lang={lang} />
      </Field>

      {/* Food Preference */}
      <Field>
        <FieldLabel>
          {lang === "ta" ? "உணவு விருப்பம்" : "Food Preference"}
        </FieldLabel>
        <MultiSelect name="foodPref" options={FOOD_OPTS} lang={lang} />
      </Field>

      {/* Education Preference */}
      <Field>
        <FieldLabel>
          {lang === "ta" ? "கல்வி விருப்பம்" : "Education Preference"}
        </FieldLabel>
        <select
          {...register("educationPref")}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">
            {lang === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select..."}
          </option>
          {EDU_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en === o.ta ? o.en : `${o.en} / ${o.ta}`}
            </option>
          ))}
        </select>
      </Field>

      {/* Income Preference */}
      <Field>
        <FieldLabel>
          {lang === "ta" ? "குறைந்தபட்ச வருமானம்" : "Minimum Income"}
        </FieldLabel>
        <div className="flex flex-wrap gap-2">
          {INCOME_OPTS.map((opt) => {
            const selected = watch("incomePref") === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setValue("incomePref", opt.value, { shouldValidate: true })
                }
                className={[
                  "rounded-xl border px-4 py-2.5 text-sm transition-all",
                  selected
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-background text-foreground/80 hover:bg-secondary",
                ].join(" ")}
              >
                {opt.en} {opt.en !== opt.ta && <span className="font-tamil ml-1 opacity-70 text-xs">{opt.ta}</span>}
              </button>
            )
          })}
        </div>
      </Field>

      {/* Porutham */}
      <Field>
        <FieldLabel>
          {lang === "ta" ? "குறைந்தபட்ச பொருத்தங்கள்" : "Minimum Porutham Match"}
        </FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[4, 5, 6, 7, 8, 10].map((n) => {
            const selected = watch("minimumPoruthams") === n
            return (
              <button
                key={n}
                type="button"
                onClick={() =>
                  setValue("minimumPoruthams", n, { shouldValidate: true })
                }
                className={[
                  "rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all",
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground/80 hover:bg-secondary",
                ].join(" ")}
              >
                {n}/10
              </button>
            )
          })}
        </div>
      </Field>

      {/* Employment Preference */}
      <Field>
        <FieldLabel>
          {lang === "ta" ? "வேலை விருப்பம்" : "Employment Preference"}
        </FieldLabel>
        <MultiSelect name="employmentPref" options={EMP_PREF_OPTS} lang={lang} />
      </Field>

      {/* Location Preference */}
      <Field>
        <FieldLabel>
          {lang === "ta" ? "இட விருப்பம் (மாநிலம்)" : "Location Preference (State)"}
        </FieldLabel>
        <MultiSelect name="locationPref" options={STATE_PREF_OPTS} lang={lang} />
      </Field>

      {/* Custom Note */}
      <Field>
        <FieldLabel>
          {lang === "ta"
            ? "கூடுதல் குறிப்பு (விருப்பத்தக்கது)"
            : "Additional Note (Optional)"}
        </FieldLabel>
        <textarea
          {...register("customNote")}
          maxLength={500}
          rows={3}
          placeholder={
            lang === "ta"
              ? "உங்கள் எதிர்பார்ப்புகள் பற்றி சுருக்கமாக..."
              : "Briefly describe your expectations..."
          }
          className="flex w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-tamil"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">
          {(watch("customNote") as string)?.length ?? 0} / 500
        </p>
      </Field>
    </div>
  )
}
