/**
 * astrology-api.ts
 * Typed API client for astrology chart history endpoints.
 */

import type { JyotishResult } from "./jyotish-calc"

const BASE = "http://localhost:5000/api/astrology"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("maratha_token")
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SaveChartInput {
  name: string
  gender: string
  dob: string
  timeOfBirth: string
  placeName: string
  latitude: number
  longitude: number
  resultJson: JyotishResult
}

export interface ChartSummary {
  id: string
  name: string
  gender: string
  dob: string
  time_of_birth: string
  place_name: string
  moon_rasi_tamil: string
  natchathiram_tamil: string
  lagnam_tamil: string
  pada: number
  created_at: string
  user_email?: string // admin only
}

export interface ChartDetail {
  id: string
  user_id: string
  name: string
  gender: string
  dob: string
  time_of_birth: string
  place_name: string
  latitude: number
  longitude: number
  result_json: JyotishResult
  created_at: string
}

export interface ChartListResponse {
  charts: ChartSummary[]
  total: number
  page: number
  limit: number
}

// ── API Functions ─────────────────────────────────────────────────────────────

/** Save a newly calculated chart for the logged-in user */
export async function saveChart(input: SaveChartInput): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${BASE}/charts`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(input),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/** List the current user's chart history */
export async function listCharts(page = 1, limit = 20): Promise<ChartListResponse | null> {
  try {
    const res = await fetch(`${BASE}/charts?page=${page}&limit=${limit}`, {
      headers: authHeaders(),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/** Get a single chart by ID */
export async function getChart(id: string): Promise<ChartDetail | null> {
  try {
    const res = await fetch(`${BASE}/charts/${id}`, {
      headers: authHeaders(),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/** Admin: list ALL charts from all users */
export async function adminListCharts(page = 1, limit = 50, search = "", isDeleted = false): Promise<ChartListResponse | null> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.set("search", search)
    if (isDeleted) params.set("isDeleted", "true")
    const res = await fetch(`${BASE}/admin/charts?${params}`, {
      headers: authHeaders(),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/** Soft-delete a chart by ID (owner or admin only) */
export async function deleteChart(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/charts/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    if (res.ok) return { ok: true }
    const body = await res.json().catch(() => ({}))
    return { ok: false, error: (body as { message?: string })?.message || "Failed to delete chart" }
  } catch {
    return { ok: false, error: "Network error" }
  }
}
