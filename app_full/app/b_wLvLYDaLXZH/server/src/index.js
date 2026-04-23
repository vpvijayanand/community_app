import { createApp } from "./app.js"
import { env } from "./config/env.js"
import { pool, healthcheck } from "./config/db.js"

const app = createApp()

async function start() {
  try {
    await healthcheck()
    console.log("[server] Database reachable.")
  } catch (err) {
    console.error("[server] Database unreachable — did you run `npm run migrate`?")
    console.error(err.message)
  }

  const server = app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`)
    console.log(`[server] NODE_ENV=${env.nodeEnv}`)
  })

  const shutdown = (signal) => async () => {
    console.log(`[server] ${signal} received, shutting down...`)
    server.close(() => {
      pool.end().finally(() => process.exit(0))
    })
  }
  process.on("SIGINT", shutdown("SIGINT"))
  process.on("SIGTERM", shutdown("SIGTERM"))
}

start()
