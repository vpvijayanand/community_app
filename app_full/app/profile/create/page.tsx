"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  useForm,
  FormProvider,
  type SubmitHandler,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { BasicDetailsStep } from "./components/BasicDetailsStep"
import { PhysicalDetailsStep } from "./components/PhysicalDetailsStep"
import { CareerDetailsStep } from "./components/CareerDetailsStep"
import { EducationDetailsStep } from "./components/EducationDetailsStep"
import { FamilyDetailsStep } from "./components/FamilyDetailsStep"
import { LocationDetailsStep } from "./components/LocationDetailsStep"
import { AstrologyDetailsStep } from "./components/AstrologyDetailsStep"
import { ExpectationsPhotosStep } from "./components/ExpectationsPhotosStep"

import { useAuth } from "@/lib/auth-context"
import { useProfileStore, type PhotoItem } from "@/hooks/use-profile-store"
import { useProfilesStore, RELATIONSHIP_LABELS, type ProfileRelationship } from "@/hooks/use-profiles-store"

// ── Language ─────────────────────────────────────────────────────────────────
type Lang = "ta" | "en"

// ── Zod Schemas (per step) ────────────────────────────────────────────────────

function makeSchemas(lang: Lang) {
  const t = (ta: string, en: string) => (lang === "ta" ? ta : en)

  // Step 1
  const basicSchema = z.object({
    fullName: z
      .string()
      .min(2, t("பெயர் குறைந்தது 2 எழுத்துக்கள் இருக்க வேண்டும்", "Name must be at least 2 characters"))
      .max(60, t("பெயர் 60 எழுத்துக்களுக்கு உட்பட்டதாக இருக்க வேண்டும்", "Name must be under 60 characters")),
    gender: z
      .enum(["male", "female"], {
        errorMap: () => ({ message: t("பாலினம் தேர்ந்தெடுக்கவும்", "Please select a gender") }),
      }),
    dateOfBirth: z
      .string()
      .min(1, t("பிறந்த தேதி உள்ளிடவும்", "Please enter date of birth"))
      .refine((d) => {
        const age = (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
        return age >= 18
      }, t("வயது 18-ஐ கடந்திருக்க வேண்டும்", "You must be at least 18 years old")),
    maritalStatus: z
      .string()
      .min(1, t("திருமண நிலை தேர்ந்தெடுக்கவும்", "Please select marital status")),
    motherTongue: z
      .string()
      .min(1, t("தாய்மொழி தேர்ந்தெடுக்கவும்", "Please select mother tongue")),
    religion: z
      .string()
      .min(1, t("மதம் தேர்ந்தெடுக்கவும்", "Please select religion")),
  })

  // Step 2
  const physicalSchema = z.object({
    height: z
      .number({ invalid_type_error: t("உயரம் உள்ளிடவும்", "Enter a valid height") })
      .min(140, t("உயரம் குறைந்தது 140 செ.மீ. இருக்க வேண்டும்", "Height must be at least 140 cm"))
      .max(200, t("உயரம் அதிகபட்சம் 200 செ.மீ.", "Height can be at most 200 cm")),
    weight: z
      .number({ invalid_type_error: t("எடை உள்ளிடவும்", "Enter a valid weight") })
      .min(30, t("எடை குறைந்தது 30 கிலோ இருக்க வேண்டும்", "Weight must be at least 30 kg"))
      .max(150, t("எடை அதிகபட்சம் 150 கிலோ", "Weight can be at most 150 kg"))
      .optional(),
    complexion: z
      .string()
      .min(1, t("நிறம் தேர்ந்தெடுக்கவும்", "Please select a complexion")),
    foodPreference: z
      .string()
      .min(1, t("உணவு விருப்பம் தேர்ந்தெடுக்கவும்", "Please select food preference")),
    bodyType: z
      .string()
      .min(1, t("உடல் வகை தேர்ந்தெடுக்கவும்", "Please select body type")),
  })

  // Step 3
  const careerSchema = z.object({
    employmentType: z
      .string()
      .min(1, t("வேலை வகை தேர்ந்தெடுக்கவும்", "Please select employment type")),
    annualIncome: z
      .string()
      .min(1, t("வருடாந்திர வருமானம் தேர்ந்தெடுக்கவும்", "Please select annual income")),
  })

  // Step 4
  const educationSchema = z.object({
    qualification: z
      .string()
      .min(1, t("கல்வி தகுதி தேர்ந்தெடுக்கவும்", "Please select your qualification")),
  })

  // Step 5
  const familySchema = z.object({
    familyType: z
      .string()
      .min(1, t("குடும்ப வகை தேர்ந்தெடுக்கவும்", "Please select family type")),
    familyValues: z
      .string()
      .min(1, t("குடும்ப மதிப்புகள் தேர்ந்தெடுக்கவும்", "Please select family values")),
  })

  // Step 6
  const locationSchema = z.object({
    state: z
      .string()
      .min(1, t("மாநிலம் தேர்ந்தெடுக்கவும்", "Please select a state")),
    city: z
      .string()
      .min(1, t("நகரம் உள்ளிடவும்", "Please enter your city")),
    willingToRelocate: z
      .string()
      .min(1, t("இடம் மாற விருப்பம் தேர்ந்தெடுக்கவும்", "Please select relocation preference")),
  })

  // Step 7 — Astrology (optional fields)
  const astrologySchema = z.object({
    exactBirthTime: z.string().optional(),
    birthAmPm: z.enum(["AM", "PM"]).optional(),
    birthPlace: z.string().optional(),
  })

  // Step 8 — Expectations + Photos (all optional, photos validated separately)
  const expectationsSchema = z.object({
    ageRangeMin:    z.number().optional(),
    ageRangeMax:    z.number().optional(),
    heightRangeMin: z.number().optional(),
    heightRangeMax: z.number().optional(),
    complexionPref: z.array(z.string()).optional(),
    foodPref:       z.array(z.string()).optional(),
    educationPref:  z.string().optional(),
    employmentPref: z.array(z.string()).optional(),
    incomePref:     z.string().optional(),
    locationPref:   z.array(z.string()).optional(),
    minimumPoruthams: z.number().optional(),
    customNote:     z.string().max(500).optional(),
  })

  return [
    basicSchema,       // 1
    physicalSchema,    // 2
    careerSchema,      // 3
    educationSchema,   // 4
    familySchema,      // 5
    locationSchema,    // 6
    astrologySchema,   // 7
    expectationsSchema,// 8
  ] as const
}

// ── Steps meta ────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Basic Details",            tLabel: "அடிப்படை விவரங்கள்"   },
  { label: "Physical Details",         tLabel: "உடல் விவரங்கள்"       },
  { label: "Career Details",           tLabel: "தொழில் விவரங்கள்"     },
  { label: "Education Details",        tLabel: "கல்வி விவரங்கள்"      },
  { label: "Family Details",           tLabel: "குடும்ப விவரங்கள்"    },
  { label: "Location Details",         tLabel: "இடம் விவரங்கள்"       },
  { label: "Astrology",                tLabel: "அடிப்படை ஜாதகம்"     },
  { label: "Expectations & Photos",    tLabel: "எதிர்பார்ப்பு & படங்கள்" },
]

// ── Wizard ────────────────────────────────────────────────────────────────────

export default function ProfileWizard() {
  const router = useRouter()
  const { user } = useAuth()
  const { wizardData, currentStep, setStep, updateStep, reset: resetWizard } = useProfileStore()
  const { addProfile } = useProfilesStore()

  // Step 0 — relationship selection (before the 8-step wizard)
  const [step0Done, setStep0Done] = useState(false)
  const [relationship, setRelationship] = useState<ProfileRelationship>("self")

  const lang: Lang = "ta" // Tamil by default; swap to "en" when ?lang=en

  // Always start a fresh wizard for each new profile
  useEffect(() => {
    resetWizard()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Photo state — live in component, committed to Zustand on Next
  const [photos, setPhotos] = useState<PhotoItem[]>(wizardData.photos ?? [])
  const [photoError, setPhotoError] = useState<string | null>(null)

  const schemas = useMemo(() => makeSchemas(lang), [lang])
  const schema = schemas[currentStep - 1] as z.ZodTypeAny

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: wizardData as Record<string, unknown>,
    mode: "onTouched",
  })

  const { handleSubmit, formState: { isSubmitting }, reset } = methods

  // Sync Zustand → form whenever step changes
  useEffect(() => {
    reset(wizardData as Record<string, unknown>)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  // Sync wizard photos state when navigating back to step 8
  useEffect(() => {
    if (currentStep === 8) {
      setPhotos(wizardData.photos ?? [])
    }
  }, [currentStep, wizardData.photos])

  const progressValue = (currentStep / STEPS.length) * 100

  const onNext: SubmitHandler<Record<string, unknown>> = useCallback(
    (data) => {
      // On step 8, merge photos into wizard data too
      if (currentStep === 8) {
        const finalData = { ...data, photos }
        updateStep(finalData)

        // Save as a new ProfileEntry in the global store
        addProfile({
          id: `profile_${Date.now()}`,
          ownerEmail: user?.email ?? "unknown",
          relationship,
          status: "pending",
          fullName: (wizardData.fullName as string) || "New Profile",
          gender: (wizardData.gender as "male" | "female") || "male",
          createdAt: new Date().toISOString(),
          wizardData: finalData,
        })

        // Reset the single-profile wizard store
        resetWizard()

        router.push("/dashboard")
        return
      }

      updateStep(data)

      if (currentStep < STEPS.length) {
        setStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    },
    [currentStep, updateStep, setStep, router, photos]
  )

  const handleBack = () => {
    if (currentStep > 1) {
      const values = methods.getValues()
      updateStep(values)
      setStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Step 0 — Relationship selection screen
  if (!step0Done) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground">
                Who are you creating this profile for?
              </h1>
              <p className="font-tamil mt-1 text-muted-foreground">
                இந்த சுயவிவரம் யாருக்காக?
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:grid-cols-3">
              {(Object.entries(RELATIONSHIP_LABELS) as [ProfileRelationship, { label: string; tamil: string }][]).map(
                ([key, { label, tamil }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRelationship(key)}
                    className={[
                      "flex flex-col items-start gap-1 rounded-xl border px-5 py-4 text-left transition-all",
                      relationship === key
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-primary/40 hover:bg-secondary",
                    ].join(" ")}
                  >
                    <span className="text-base font-medium text-foreground">{label}</span>
                    <span className="font-tamil text-sm text-muted-foreground">{tamil}</span>
                  </button>
                )
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => { setStep0Done(true); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                size="lg"
                className="h-11 min-w-[160px] bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue →
              </Button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-12">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="flex flex-wrap items-baseline gap-2 font-serif text-2xl font-semibold text-foreground">
                Create your profile
                <span className="font-tamil text-xl text-muted-foreground opacity-80">
                  சுயவிவரம் உருவாக்கவும்
                </span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{STEPS[currentStep - 1].label}</span>
                <span className="font-tamil ml-2 opacity-80">
                  {STEPS[currentStep - 1].tLabel}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="inline-flex items-center justify-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-muted-foreground tabular-nums">
                {currentStep} / {STEPS.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] uppercase tracking-wider text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => {
                  if (currentStep < STEPS.length) {
                    setStep(currentStep + 1)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  } else {
                    router.push("/profile/me")
                  }
                }}
              >
                Skip{" "}
                <span className="font-tamil ml-1 lowercase tracking-normal">தவிர்</span>
              </Button>
            </div>
          </div>

          {/* Step dots */}
          <div className="mt-4 flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i + 1 <= currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <Progress value={progressValue} className="mt-2 h-1 w-full opacity-0 absolute" />
        </div>

        {/* ── Card ── */}
        <div className="flex-1 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-10">
          <FormProvider {...methods}>
            <form
              className="space-y-8"
              onSubmit={handleSubmit(onNext as SubmitHandler<Record<string, unknown>>)}
            >
              {/* Step panels */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {currentStep === 1 && <BasicDetailsStep />}
                  {currentStep === 2 && <PhysicalDetailsStep />}
                  {currentStep === 3 && <CareerDetailsStep />}
                  {currentStep === 4 && <EducationDetailsStep />}
                  {currentStep === 5 && <FamilyDetailsStep />}
                  {currentStep === 6 && <LocationDetailsStep />}
                  {currentStep === 7 && <AstrologyDetailsStep />}
                  {currentStep === 8 && (
                    <ExpectationsPhotosStep
                      lang={lang}
                      photos={photos}
                      onPhotosChange={setPhotos}
                      photoError={photoError}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* ── Controls ── */}
              <div className="flex items-center justify-between border-t border-border/60 pt-8">
                <Button
                  type="button"
                  variant="outline"
                  className={`h-11 min-w-[120px] ${currentStep === 1 ? "invisible" : ""}`}
                  onClick={handleBack}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {lang === "ta" ? "முந்தைய" : "Back"}
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {currentStep === STEPS.length ? (
                    <>
                      {lang === "ta" ? "சமர்ப்பி" : "Finish Profile"}{" "}
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      {lang === "ta" ? "அடுத்து" : "Next Step"}{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
