"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"

// ── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "groom" | "bride" | "normal" | "parent"

export type AuthUser = {
  role: UserRole
  email: string
  phone: string
  firstName: string
  lastName: string
  lookingFor?: "bride" | "groom"
  managedProfileIds: string[]
}

type AuthContextValue = {
  user: AuthUser | null
  isLoggedIn: boolean
  login: (
    email: string,
    password: string
  ) => { success: boolean; destination: string; error?: string }
  loginAs: (preset: "admin" | "groom" | "bride" | "normal" | "parent") => {
    success: boolean
    destination: string
  }
  register: (
    data: { firstName: string; lastName: string; email: string; phone: string }
  ) => { success: boolean; destination: string }
  addProfileId: (id: string) => void
  logout: () => void
}

// ── Dummy Credentials Registry ───────────────────────────────────────────────

const DUMMY_USERS: Record<
  string,
  { password: string; user: AuthUser; destination: string }
> = {
  "admin@mathat.in": {
    password: "Admin@123",
    destination: "/admin",
    user: {
      role: "admin",
      email: "admin@mathat.in",
      phone: "9999999999",
      firstName: "Admin",
      lastName: "User",
      managedProfileIds: [],
    },
  },
  "arun@example.com": {
    password: "Groom@123",
    destination: "/dashboard",
    user: {
      role: "groom",
      email: "arun@example.com",
      phone: "9123456780",
      firstName: "Arun",
      lastName: "Velan",
      lookingFor: "bride",
      managedProfileIds: ["u001"],
    },
  },
  "meera@example.com": {
    password: "Bride@123",
    destination: "/dashboard",
    user: {
      role: "bride",
      email: "meera@example.com",
      phone: "9876543210",
      firstName: "Meera",
      lastName: "Iyer",
      lookingFor: "groom",
      managedProfileIds: ["u002"],
    },
  },
  "test@example.com": {
    password: "User@123",
    destination: "/dashboard",
    user: {
      role: "normal",
      email: "test@example.com",
      phone: "9000000000",
      firstName: "Test",
      lastName: "User",
      managedProfileIds: [],
    },
  },
  "parent@example.com": {
    password: "Parent@123",
    destination: "/dashboard",
    user: {
      role: "parent",
      email: "parent@example.com",
      phone: "9111111111",
      firstName: "Sivaram",
      lastName: "Iyer",
      managedProfileIds: ["u001", "u002"],
    },
  },
  "family@example.com": {
    password: "Family@123",
    destination: "/dashboard",
    user: {
      role: "parent",
      email: "family@example.com",
      phone: "9888877777",
      firstName: "Sivaram",
      lastName: "Kumar",
      managedProfileIds: [],
    },
  },
}

const PRESET_EMAIL: Record<"admin" | "groom" | "bride" | "normal" | "parent", string> = {
  admin: "admin@mathat.in",
  groom: "arun@example.com",
  bride: "meera@example.com",
  normal: "test@example.com",
  parent: "family@example.com"
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = useCallback(
    (
      email: string,
      password: string
    ): { success: boolean; destination: string; error?: string } => {
      const record = DUMMY_USERS[email.toLowerCase().trim()]
      if (!record) {
        return {
          success: false,
          destination: "/login",
          error: "No account found with that email.",
        }
      }
      if (record.password !== password) {
        return {
          success: false,
          destination: "/login",
          error: "Incorrect password.",
        }
      }
      setUser(record.user)
      if (typeof window !== "undefined") {
        localStorage.setItem("maratha_user_session", JSON.stringify(record.user))
      }
      // Authenticate against real backend to get JWT for API calls
      fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (typeof window !== "undefined") {
            if (data.token) localStorage.setItem("maratha_token", data.token)
            if (data.refreshToken) localStorage.setItem("maratha_refresh_token", data.refreshToken)
          }
        })
        .catch(() => {})
      return { success: true, destination: record.destination }
    },
    []
  )

  const register = useCallback(
    (data: { firstName: string; lastName: string; email: string; phone: string }): { success: boolean; destination: string } => {
      const newUser: AuthUser = {
        role: "normal",
        email: data.email,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        managedProfileIds: [],
      }
      setUser(newUser)
      if (typeof window !== "undefined") {
        localStorage.setItem("maratha_user_session", JSON.stringify(newUser))
      }
      // New users land on dashboard (profile creation is optional)
      return { success: true, destination: "/dashboard" }
    },
    []
  )

  /** One-click preset login for dev autofill buttons */
  const loginAs = useCallback(
    (
      preset: "admin" | "groom" | "bride" | "normal" | "parent"
    ): { success: boolean; destination: string } => {
      const email = PRESET_EMAIL[preset]
      const record = DUMMY_USERS[email]
      setUser(record.user)
      if (typeof window !== "undefined") {
        localStorage.setItem("maratha_user_session", JSON.stringify(record.user))
      }
      // Authenticate against real backend to get JWT for API calls
      fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: record.password }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (typeof window !== "undefined") {
            if (data.token) localStorage.setItem("maratha_token", data.token)
            if (data.refreshToken) localStorage.setItem("maratha_refresh_token", data.refreshToken)
          }
        })
        .catch(() => {})
      return { success: true, destination: record.destination }
    },
    []
  )

  const addProfileId = useCallback((id: string) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = {
        ...prev,
        managedProfileIds: [...prev.managedProfileIds, id],
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("maratha_user_session", JSON.stringify(updated))
      }
      return updated
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("maratha_user_session")
      localStorage.removeItem("maratha_token")
      localStorage.removeItem("maratha_refresh_token")
    }
  }, [])

  // Auto-resume session and refresh JWT if needed
  useEffect(() => {
    if (typeof window === "undefined" || user) return
    const cached = localStorage.getItem("maratha_user_session")
    if (!cached) return
    setUser(JSON.parse(cached))
    // If no access token but we have a refresh token, get a new one
    if (!localStorage.getItem("maratha_token")) {
      const refreshToken = localStorage.getItem("maratha_refresh_token")
      if (refreshToken) {
        fetch("http://localhost:5000/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.token) localStorage.setItem("maratha_token", data.token)
          })
          .catch(() => {})
      }
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, loginAs, register, addProfileId, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}

/** Role display helpers */
export const ROLE_LABELS: Record<UserRole, { label: string; tamil: string; color: string }> = {
  admin: { label: "Admin", tamil: "நிர்வாகி", color: "bg-rose-500" },
  parent: { label: "Parent", tamil: "பெற்றோர்", color: "bg-purple-500" },
  groom: { label: "Groom", tamil: "மணமகன்", color: "bg-blue-500" },
  bride: { label: "Bride", tamil: "மணமகள்", color: "bg-pink-500" },
  normal: { label: "User", tamil: "பயனர்", color: "bg-slate-500" },
}
