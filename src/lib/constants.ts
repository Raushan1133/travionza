export const APP_NAME = "Travionza"
export const APP_TAGLINE = "Journeys, Perfectly Planned"
export const SUPPORT_PHONE = "+1 (844) 555-0199"
export const SUPPORT_EMAIL = "help@travionza.com"
export const CURRENCY = "USD"
export const LOCALE = "en-US"

/** Pricing rules (all demo values – replace with backend data) */
export const TAX_RATE = 0.0875
export const AIRPORT_FEE_PER_RENTAL = 12.5
export const SERVICE_FEE_PER_DAY = 2.5
export const ONE_WAY_FEE = 35

/** Mock API behaviour. Tweak these to see loading / error states. */
export const MOCK_CONFIG = {
  minLatency: 450,
  maxLatency: 1100,
  /** 0–1: probability that any request fails (handy for testing error UI) */
  failureRate: 0,
}

export const STORAGE_KEYS = {
  theme: "driveease-theme",
  session: "driveease-session",
  users: "driveease-users",
  bookings: "driveease-bookings",
  favorites: "driveease-favorites",
  checkoutDraft: "driveease-checkout-draft",
  promoDismissed: "driveease-promo-dismissed",
  newsletter: "driveease-newsletter",
}

export const TIME_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0")
  const m = i % 2 === 0 ? "00" : "30"
  return `${h}:${m}`
})

export const DEFAULT_PICKUP_TIME = "10:00"
export const DEFAULT_RETURN_TIME = "10:00"
export const PAGE_SIZE = 9

export const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Mexico",
  "Brazil",
  "Japan",
  "Other",
]
