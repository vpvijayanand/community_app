const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("maratha_token") : null
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `API error ${res.status}`)
  }
  return res.json()
}

/**
 * Like apiFetch but retries up to `maxAttempts` times on any error,
 * with exponential back-off. Useful for admin pages where a JWT from
 * a background login fetch might not be in localStorage yet.
 */
export async function apiFetchWithRetry<T = any>(
  path: string,
  options: RequestInit = {},
  maxAttempts = 4
): Promise<T> {
  let lastErr: Error = new Error("Unknown error")
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await apiFetch<T>(path, options)
    } catch (err: any) {
      lastErr = err
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 600 * attempt))
      }
    }
  }
  // Surface a cleaner message for connection failures
  const msg = lastErr.message === "Failed to fetch"
    ? "Cannot reach the backend server"
    : lastErr.message
  throw new Error(msg)
}
