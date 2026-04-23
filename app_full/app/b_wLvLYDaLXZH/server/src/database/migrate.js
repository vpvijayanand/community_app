/**
 * Migration runner.
 *
 * Applies every `.sql` file in ./migrations in lexical order and records
 * them in schema_migrations so they are never re-applied.
 *
 * Usage:
 *   node src/database/migrate.js           # apply pending migrations
 *   node src/database/migrate.js --drop    # DROP ALL application tables first (DEV ONLY)
 */

import { readdir, readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { pool, withTransaction } from "../config/db.js"
import { isProd } from "../config/env.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, "migrations")

const TABLES_TO_DROP = [
  "article_purchases",
  "reading_progress",
  "bookmarks",
  "drafts",
  "article_tags",
  "articles",
  "sessions",
  "users",
  "schema_migrations",
]

async function dropAll() {
  if (isProd) {
    throw new Error("Refusing to --drop in production.")
  }
  console.log("[migrate] Dropping all application tables...")
  await withTransaction(async (c) => {
    for (const t of TABLES_TO_DROP) {
      await c.query(`DROP TABLE IF EXISTS ${t} CASCADE`)
    }
    await c.query(`DROP FUNCTION IF EXISTS set_updated_at() CASCADE`)
  })
}

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
}

async function appliedSet() {
  const { rows } = await pool.query("SELECT name FROM schema_migrations")
  return new Set(rows.map((r) => r.name))
}

async function applyFile(name) {
  const sql = await readFile(join(MIGRATIONS_DIR, name), "utf8")
  console.log(`[migrate] Applying ${name}...`)
  await withTransaction(async (c) => {
    await c.query(sql)
    await c.query(
      "INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING",
      [name],
    )
  })
}

async function main() {
  const shouldDrop = process.argv.includes("--drop")
  if (shouldDrop) await dropAll()

  await ensureMigrationsTable()
  const applied = await appliedSet()
  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort()

  const pending = files.filter((f) => !applied.has(f))
  if (pending.length === 0) {
    console.log("[migrate] Up to date.")
    return
  }
  for (const f of pending) await applyFile(f)
  console.log(`[migrate] Applied ${pending.length} migration(s).`)
}

main()
  .catch((err) => {
    console.error("[migrate] Failed:", err)
    process.exitCode = 1
  })
  .finally(() => pool.end())
