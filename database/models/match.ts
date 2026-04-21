/**
 * Match & Interest Models
 *
 * Table: interests
 */
export interface Interest {
  id: string
  fromUserId: string                // FK → users.id (who sent)
  toUserId: string                  // FK → users.id (who received)
  status: "pending" | "accepted" | "declined"
  message?: string                  // optional note
  respondedAt?: string
  createdAt: string
}

/**
 * Table: shortlists
 */
export interface Shortlist {
  id: string
  userId: string                    // FK → users.id (who bookmarked)
  profileId: string                 // FK → profiles.id (bookmarked profile)
  createdAt: string
}

/**
 * Table: profile_views
 * Log every profile view for analytics + limit enforcement
 */
export interface ProfileView {
  id: string
  viewerUserId: string              // FK → users.id
  viewedProfileId: string           // FK → profiles.id
  viewedAt: string
}

/**
 * Table: match_scores
 * Precomputed match scores between profile pairs
 */
export interface MatchScore {
  id: string
  profileId1: string                // FK → profiles.id
  profileId2: string                // FK → profiles.id
  totalScore: number                // 0–100
  subscriptionPoints: number        // 0, 20, 50
  completenessPoints: number        // 0–20
  birthTimePoints: number           // 0–10
  astrologyPoints: number           // 0–20
  photoPoints: number               // 0–10
  familyPoints: number              // 0–10
  activityPoints: number            // 0–10
  calculatedAt: string
}

/**
 * Table: blocks
 */
export interface Block {
  id: string
  blockerUserId: string             // FK → users.id
  blockedUserId: string             // FK → users.id
  reason?: string
  createdAt: string
}

/**
 * Table: reports
 */
export interface Report {
  id: string
  reporterUserId: string            // FK → users.id
  reportedUserId: string            // FK → users.id
  reason: "fake_profile" | "harassment" | "inappropriate_content" | "spam" | "other"
  description?: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  reviewedBy?: string               // admin user id
  reviewedAt?: string
  createdAt: string
}
