/**
 * Profile Model — Complete matrimony profile (maps to 8-step wizard)
 *
 * Table: profiles
 */
export interface Profile {
  id: string                        // UUID primary key
  userId: string                    // FK → users.id, unique (one profile per user)
  status: "draft" | "pending" | "approved" | "rejected"
  completenessScore: number         // 0–100, auto-calculated
  wizardStep: number                // last completed step (1–9)
  isVerified: boolean               // admin-verified badge
  viewCount: number                 // total views received
  createdAt: string
  updatedAt: string

  // ── Step 1: Basic Details ──
  fullName: string
  fullNameTamil?: string
  gender: "male" | "female"
  dateOfBirth: string               // YYYY-MM-DD
  age: number                       // computed from DOB
  maritalStatus: "never_married" | "divorced" | "widowed"
  motherTongue: string              // default "Tamil"
  religion: string                  // default "Hindu"

  // ── Step 2: Physical Details ──
  heightCm: number
  weightKg?: number
  complexion: "fair" | "wheatish" | "dark"
  foodPreference: "vegetarian" | "non_vegetarian" | "eggetarian"
  bodyType?: "slim" | "average" | "athletic" | "heavy"
  physicalDisability?: string       // null = none

  // ── Step 3: Career Details ──
  employmentType: "salaried" | "business" | "self_employed" | "student" | "not_working"
  companyName?: string
  designation?: string
  workLocation?: string
  annualIncome?: string             // range code: "3l-5l", "5l-10l", etc.

  // ── Step 4: Education Details ──
  qualification: string             // "graduate", "post_graduate", "phd", etc.
  fieldOfStudy?: string
  institution?: string
  graduationYear?: number

  // ── Step 5: Family Details ──
  familyType: "joint" | "nuclear"
  fatherName?: string
  fatherOccupation?: string
  fatherAlive: boolean
  motherName?: string
  motherOccupation?: string
  motherAlive: boolean
  familyStatus: "middle_class" | "upper_middle" | "affluent"
  familyValues: "orthodox" | "moderate" | "liberal"

  // ── Step 6: Location Details ──
  country: string
  state: string
  city: string
  area?: string
  nativePlace?: string
  willingToRelocate: "yes" | "no" | "open"
}

/**
 * Table: profile_siblings
 */
export interface ProfileSibling {
  id: string
  profileId: string                 // FK → profiles.id
  name: string
  gender: "male" | "female"
  maritalStatus: string
  occupation: string
  sortOrder: number
}

/**
 * Table: profile_photos
 */
export interface ProfilePhoto {
  id: string
  profileId: string                 // FK → profiles.id
  url: string                       // S3/storage URL
  thumbnailUrl?: string
  isPrimary: boolean
  blurForBasic: boolean             // privacy toggle
  sortOrder: number
  uploadedAt: string
}

/**
 * Table: profile_expectations (Step 8)
 */
export interface ProfileExpectation {
  id: string
  profileId: string                 // FK → profiles.id, unique

  ageRangeMin: number
  ageRangeMax: number
  heightRangeMin?: number           // cm
  heightRangeMax?: number           // cm
  complexionPref: string[]          // ["fair", "wheatish", "any"]
  foodPref: string[]                // ["vegetarian"]
  educationPref?: string            // "graduate", "post_graduate", etc.
  employmentPref: string[]          // ["salaried", "business"]
  incomePref?: string               // "5l+", "10l+", "any"
  locationPref: string[]            // ["tamil_nadu", "kerala"]
  minimumPoruthams: number          // 4–10, default 6
  customNote?: string               // max 500 chars

  createdAt: string
  updatedAt: string
}
