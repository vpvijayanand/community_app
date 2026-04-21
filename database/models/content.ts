/**
 * News & Learning Content Models
 *
 * Table: news_posts
 */
export interface NewsPost {
  id: string
  authorId: string                  // FK → users.id (admin)
  title: string
  titleTamil: string
  content: string                   // rich text / HTML
  contentTamil: string
  excerpt?: string
  excerptTamil?: string
  category: "events" | "obituary" | "achievements" | "community_updates" | "matrimony_tips"
  imageUrl?: string
  tags: string[]                    // JSON array
  isPublished: boolean
  publishedAt?: string
  viewCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Table: learning_articles
 */
export interface LearningArticle {
  id: string
  authorId: string                  // FK → users.id (admin)
  title: string
  titleTamil: string
  content: string                   // rich text / HTML
  contentTamil: string
  category: "culture" | "history" | "astrology_basics" | "vedic_rituals" | "community"
  imageUrl?: string
  tags: string[]
  isPublished: boolean
  publishedAt?: string
  readTimeMinutes?: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Table: ads
 */
export interface Ad {
  id: string
  createdBy: string                 // FK → users.id (admin)
  title: string
  titleTamil?: string
  description?: string
  descriptionTamil?: string
  imageUrl: string
  linkUrl?: string                  // click-through URL
  type: "wedding_invitation" | "festival_greeting" | "business_ad" | "community_event"
  startDate: string                 // ISO date
  endDate: string                   // ISO date (auto-expires)
  isActive: boolean
  impressionCount: number
  clickCount: number
  createdAt: string
  updatedAt: string
}
