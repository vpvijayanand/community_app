import { create } from "zustand"
import { persist } from "zustand/middleware"

export type PhotoItem = {
  id: string
  dataUrl: string
  croppedDataUrl: string
  isPrimary: boolean
  blurForBasic: boolean
}

export type WizardData = {
  // Step 1 — Basic Details
  fullName?: string
  gender?: "male" | "female"
  dateOfBirth?: string
  maritalStatus?: string
  motherTongue?: string
  religion?: string

  // Step 2 — Physical Details
  height?: number
  weight?: number
  complexion?: string
  foodPreference?: string
  bodyType?: string
  physicalDisability?: string

  // Step 3 — Career Details
  employmentType?: string
  companyName?: string
  designation?: string
  workLocation?: string
  annualIncome?: string

  // Step 4 — Education Details
  qualification?: string
  fieldOfStudy?: string
  institution?: string
  graduationYear?: number

  // Step 5 — Family Details
  familyType?: string
  fatherName?: string
  fatherOccupation?: string
  fatherAlive?: boolean
  motherName?: string
  motherOccupation?: string
  motherAlive?: boolean
  siblings?: Array<{ name: string; gender: string; maritalStatus: string; occupation: string }>
  familyStatus?: string
  familyValues?: string

  // Step 6 — Location Details
  country?: string
  state?: string
  city?: string
  area?: string
  nativePlace?: string
  willingToRelocate?: string

  // Step 7 — Astrology Details
  exactBirthTime?: string
  birthAmPm?: "AM" | "PM"
  birthPlace?: string

  // Step 8 — Expectations
  ageRangeMin?: number
  ageRangeMax?: number
  heightRangeMin?: number
  heightRangeMax?: number
  complexionPref?: string[]
  foodPref?: string[]
  educationPref?: string
  employmentPref?: string[]
  incomePref?: string
  locationPref?: string[]
  minimumPoruthams?: number
  customNote?: string

  // Step 9 — Photos
  photos?: PhotoItem[]
}

type ProfileStore = {
  wizardData: WizardData
  currentStep: number
  setStep: (step: number) => void
  updateStep: (data: Partial<WizardData>) => void
  reset: () => void
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      wizardData: {},
      currentStep: 1,
      setStep: (step) => set({ currentStep: step }),
      updateStep: (data) =>
        set((state) => ({ wizardData: { ...state.wizardData, ...data } })),
      reset: () => set({ wizardData: {}, currentStep: 1 }),
    }),
    {
      name: "maratha-profile-wizard",
    }
  )
)
