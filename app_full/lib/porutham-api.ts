import type { PoruthItem } from "./porutham"

export interface MatchingResult {
  items: PoruthItem[]
  matchedCount: number
  totalScore: number
}

// A subset to map the backend response for frontend displays
export interface MatchHistoryListResponse {
  matches: {
    id: string
    boy_name: string
    girl_name: string
    boy_dob: string
    girl_dob: string
    matched_count: number
    total_score: number
    created_at: string
    user_email?: string
  }[]
  total: number
  page: number
  limit: number
}

export interface MatchDetail {
  id: string
  user_id?: string
  boy_name: string
  girl_name: string
  boy_dob: string
  girl_dob: string
  boy_time_of_birth: string
  girl_time_of_birth: string
  boy_place: string
  girl_place: string
  result_json: MatchingResult
  created_at: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/** Save a newly calculated matching result to the backend */
export async function savePoruthamMatch(
  reqBody: {
    boyName: string, boyDob: string, boyTime: string, boyPlace: string,
    girlName: string, girlDob: string, girlTime: string, girlPlace: string,
    resultJson: MatchingResult
  }
) {
  const token = localStorage.getItem("maratha_token")
  if (!token) return null // Only logged in users can save history

  const res = await fetch(`${API_URL}/porutham/matches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reqBody),
  })
  
  if (!res.ok) throw new Error("Failed to save match result")
  return res.json()
}

/** Get the logged-in user's porutham matches (paginated) */
export async function listPoruthamHistory(page = 1, limit = 20): Promise<MatchHistoryListResponse | null> {
  const token = localStorage.getItem("maratha_token")
  if (!token) return null

  const res = await fetch(`${API_URL}/porutham/matches?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

/** Get a single porutham match by ID (auth required, ownership checked on backend) */
export async function getPoruthamMatch(id: string): Promise<MatchDetail | null> {
  const token = localStorage.getItem("maratha_token")
  if (!token) return null

  const res = await fetch(`${API_URL}/porutham/matches/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

/** Admin: list all porutham match history across all users (paginated + search) */
export async function adminListPoruthamHistory(page = 1, limit = 50, search = ""): Promise<MatchHistoryListResponse | null> {
  const token = localStorage.getItem("maratha_token")
  if (!token) return null

  const res = await fetch(`${API_URL}/porutham/admin/matches?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}
