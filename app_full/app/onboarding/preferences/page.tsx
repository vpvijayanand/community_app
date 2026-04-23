"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AuthShell } from "@/components/auth-shell"
import { ExpectationsStep } from "@/app/profile/create/components/ExpectationsStep"
import { useProfileStore } from "@/hooks/use-profile-store"

const t = (ta: string, en: string) => ta // Defaulting to ta for error messages for now

const expectationsSchema = z.object({
  ageRangeMin: z
    .number({ invalid_type_error: t("வயது வரம்பு உள்ளிடவும்", "Enter minimum age") })
    .min(18, t("குறைந்தபட்சம் 18 வயது", "Minimum age is 18"))
    .optional(),
  ageRangeMax: z
    .number({ invalid_type_error: t("வயது வரம்பு உள்ளிடவும்", "Enter maximum age") })
    .max(70, t("அதிகபட்சம் 70 வயது", "Maximum age is 70"))
    .optional(),
  complexionPref: z.array(z.string()).optional(),
  foodPref: z.array(z.string()).optional(),
  educationPref: z.string().optional(),
  incomePref: z.string().optional(),
  minimumPoruthams: z.number().optional(),
  employmentPref: z.array(z.string()).optional(),
  locationPref: z.array(z.string()).optional(),
  customNote: z.string().optional(),
})

export default function PreferencesPage() {
  const router = useRouter()
  const lang = "ta"
  const { wizardData, updateStep } = useProfileStore()
  
  const methods = useForm({
    resolver: zodResolver(expectationsSchema),
    defaultValues: wizardData as Record<string, unknown>,
    mode: "onTouched",
  })
  
  const { handleSubmit, formState: { isSubmitting } } = methods

  const onSubmit: SubmitHandler<Record<string, unknown>> = (data) => {
    updateStep(data)
    useProfileStore.setState((s) => ({
      ...s,
      hasPreferences: true,
    }))
    router.push("/dashboard")
  }

  return (
    <AuthShell
      title="Set your partner preferences"
      subtitle="துணை விருப்பங்களை அமைக்கவும்"
    >
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
        <FormProvider {...methods}>
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            
            <ExpectationsStep lang={lang} />
            
            <div className="pt-6 border-t border-border mt-8 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-12 px-8 bg-primary text-primary-foreground text-base shadow-sm"
              >
                <>
                  Save Preferences
                  <span className="font-tamil ml-2">சமர்ப்பி</span>
                  <Check className="ml-2 h-4 w-4" />
                </>
              </Button>
            </div>
            
          </form>
        </FormProvider>
      </div>
    </AuthShell>
  )
}
