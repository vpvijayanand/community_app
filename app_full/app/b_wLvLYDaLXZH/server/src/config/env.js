/**
 * Centralized environment configuration with sensible defaults.
 * Fails fast in production if required secrets are missing.
 */

const required = (name, value) => {
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required env var: ${name}`)
    }
    console.warn(`[env] Missing ${name}; using insecure development default.`)
  }
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  database: {
    url: process.env.DATABASE_URL,
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: process.env.PGSSL === "true",
  },

  jwt: {
    accessSecret:
      required("JWT_ACCESS_SECRET", process.env.JWT_ACCESS_SECRET) ??
      "dev-access-secret-do-not-use-in-prod",
    refreshSecret:
      required("JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET) ??
      "dev-refresh-secret-do-not-use-in-prod",
    accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL ?? "30d",
  },

  cookie: {
    domain: process.env.COOKIE_DOMAIN ?? "localhost",
    secure: process.env.COOKIE_SECURE === "true",
  },

  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL ?? "admin@mathat.local",
    adminPassword: process.env.SEED_ADMIN_PASSWORD ?? "change-me-admin-password",
  },
}

export const isProd = env.nodeEnv === "production"
