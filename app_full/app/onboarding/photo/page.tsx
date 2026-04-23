"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AuthShell } from "@/components/auth-shell"
import { PhotoUploadStep, type PhotoItem } from "@/app/profile/create/components/PhotoUploadStep"
import { useProfileStore } from "@/hooks/use-profile-store"

export default function PhotoPage() {
  const router = useRouter()
  const lang = "ta"
  const { wizardData, updateStep } = useProfileStore()
  
  const [photos, setPhotos] = useState<PhotoItem[]>(wizardData.photos ?? [])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (photos.length === 0) {
      setPhotoError(
        lang === "ta"
          ? "குறைந்தது 1 படம் சேர்க்கவும்"
          : "Please upload at least 1 photo"
      )
      return
    }
    
    setPhotoError(null)
    setIsSubmitting(true)
    
    updateStep({ photos })
    useProfileStore.setState((s) => ({
      ...s,
      hasPhoto: true,
    }))
    
    router.push("/dashboard")
  }

  return (
    <AuthShell
      title="Add a profile photo"
      subtitle="சுயவிவர படத்தைச் சேர்க்கவும்"
    >
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
        <form className="space-y-8" onSubmit={handleSubmit}>
          
          <PhotoUploadStep
            photos={photos}
            onChange={setPhotos}
            lang={lang}
            errors={photoError}
          />
          
          <div className="pt-6 border-t border-border mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-8 bg-primary text-primary-foreground text-base shadow-sm"
            >
              <>
                Save Photos
                <span className="font-tamil ml-2">சமர்ப்பி</span>
                <Check className="ml-2 h-4 w-4" />
              </>
            </Button>
          </div>
          
        </form>
      </div>
    </AuthShell>
  )
}
