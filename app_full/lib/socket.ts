/**
 * Socket.IO service stub for Maratha Chat.
 * In production: replace with real socket.io-client import and connection.
 *
 * This file is safe to import in both client and server contexts:
 * the actual socket is only initialized client-side.
 */

export type SocketEventName = "new_message" | "message_read" | "user_online"

type Listener = (...args: unknown[]) => void

/** Minimal type-safe event emitter used as a drop-in until Socket.IO is wired. */
class EventBus {
  private listeners = new Map<string, Listener[]>()

  on(event: string, fn: Listener) {
    const list = this.listeners.get(event) ?? []
    this.listeners.set(event, [...list, fn])
    return () => this.off(event, fn)
  }

  off(event: string, fn: Listener) {
    const list = this.listeners.get(event) ?? []
    this.listeners.set(event, list.filter((l) => l !== fn))
  }

  emit(event: string, ...args: unknown[]) {
    const list = this.listeners.get(event) ?? []
    list.forEach((fn) => fn(...args))
  }
}

// Singleton bus - shared across the app
const bus = new EventBus()

export const socketService = {
  /**
   * Connect with auth token.
   * Replace body with: socket = io(process.env.NEXT_PUBLIC_API_URL, { auth: { token } })
   */
  connect(token: string) {
    if (typeof window === "undefined") return
    console.debug("[Socket] connect()", token ? "with token" : "no token")
    // TODO: replace with real socket.io-client init
  },

  disconnect() {
    console.debug("[Socket] disconnect()")
  },

  on(event: SocketEventName, fn: Listener) {
    return bus.on(event, fn)
  },

  off(event: SocketEventName, fn: Listener) {
    bus.off(event, fn)
  },

  /** Simulate incoming message for development */
  simulate(event: SocketEventName, payload: unknown) {
    bus.emit(event, payload)
  },
}
