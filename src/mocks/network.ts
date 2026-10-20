import { MOCK_CONFIG } from "@/lib/constants"

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

interface NetworkOptions {
  /** Override latency range (ms). Use small values for cheap lookups. */
  min?: number
  max?: number
  /** Skip the random failure roll (e.g. for auth) */
  reliable?: boolean
}

/**
 * Pretend to be a network call: wait a realistic amount of time, optionally
 * fail, then run the "server" logic and hand back a deep clone so callers can
 * never mutate the in-memory JSON by accident.
 */
export async function respond<T>(handler: () => T, opts: NetworkOptions = {}): Promise<T> {
  const min = opts.min ?? MOCK_CONFIG.minLatency
  const max = opts.max ?? MOCK_CONFIG.maxLatency
  await sleep(min + Math.random() * Math.max(0, max - min))

  if (!opts.reliable && Math.random() < MOCK_CONFIG.failureRate) {
    throw new ApiError("We couldn't reach the server. Please try again.", 503)
  }

  const result = handler()
  return result === undefined ? result : (JSON.parse(JSON.stringify(result)) as T)
}

export const fast: NetworkOptions = { min: 150, max: 400 }
