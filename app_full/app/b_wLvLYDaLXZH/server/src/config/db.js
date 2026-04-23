/**
 * PostgreSQL connection pool.
 *
 * Exposes:
 *   - pool: the shared pg.Pool
 *   - query(text, params): convenience one-shot query
 *   - withTransaction(cb): runs cb(client) inside BEGIN/COMMIT (ROLLBACK on throw)
 */

import pg from "pg"
import { env, isProd } from "./env.js"

const { Pool } = pg

const poolConfig = env.database.url
  ? {
      connectionString: env.database.url,
      ssl: env.database.ssl ? { rejectUnauthorized: false } : false,
    }
  : {
      host: env.database.host,
      port: env.database.port,
      user: env.database.user,
      password: env.database.password,
      database: env.database.database,
      ssl: env.database.ssl ? { rejectUnauthorized: false } : false,
    }

export const pool = new Pool({
  ...poolConfig,
  max: isProd ? 20 : 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

pool.on("error", (err) => {
  console.error("[db] idle client error:", err)
})

export const query = (text, params) => pool.query(text, params)

export async function withTransaction(cb) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await cb(client)
    await client.query("COMMIT")
    return result
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {})
    throw err
  } finally {
    client.release()
  }
}

export async function healthcheck() {
  const { rows } = await query("SELECT now() AS now, current_database() AS db")
  return rows[0]
}
