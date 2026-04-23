import { create } from "zustand"
import { persist } from "zustand/middleware"

// ── Types ──────────────────────────────────────────────────────────────────────

export type ProfileRelationship =
  | "self"
  | "son"
  | "daughter"
  | "friend"
  | "relative"

export const RELATIONSHIP_LABELS: Record<ProfileRelationship, { label: string; tamil: string }> = {
  self:     { label: "Self",            tamil: "தானே"           },
  son:      { label: "Son",             tamil: "மகன்"            },
  daughter: { label: "Daughter",        tamil: "மகள்"            },
  friend:   { label: "Friend",          tamil: "நண்பர்"          },
  relative: { label: "Relative / Guardian", tamil: "உறவினர் / பாதுகாவலர்" },
}

export type ProfileStatus = "pending" | "approved" | "rejected"

export type ProfileEntry = {
  id: string
  ownerEmail: string         // the logged-in account email
  relationship: ProfileRelationship
  status: ProfileStatus
  fullName: string
  gender: "male" | "female"
  createdAt: string          // ISO timestamp
  // Wizard data embedded summary
  wizardData: Record<string, unknown>
}

// ── Store ──────────────────────────────────────────────────────────────────────

type ProfilesStore = {
  profiles: ProfileEntry[]
  addProfile: (entry: ProfileEntry) => void
  updateProfileStatus: (id: string, status: ProfileStatus) => void
  getProfilesByOwner: (email: string) => ProfileEntry[]
  getAllProfiles: () => ProfileEntry[]
}

export const useProfilesStore = create<ProfilesStore>()(
  persist(
    (set, get) => ({
      profiles: [],

      addProfile: (entry) =>
        set((state) => ({ profiles: [...state.profiles, entry] })),

      updateProfileStatus: (id, status) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        })),

      getProfilesByOwner: (email) =>
        get().profiles.filter(
          (p) => p.ownerEmail.toLowerCase() === email.toLowerCase()
        ),

      getAllProfiles: () => get().profiles,
    }),
    { name: "maratha-profiles" }
  )
)
