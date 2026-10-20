import { differenceInCalendarDays, format, parseISO, isValid } from "date-fns"
import { CURRENCY, LOCALE } from "@/lib/constants"

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
})
const currencyWholeFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number, opts?: { whole?: boolean }) {
  return (opts?.whole ? currencyWholeFormatter : currencyFormatter).format(amount)
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat(LOCALE).format(n)
}

/** yyyy-MM-dd string for a Date (local time, no timezone shifts) */
export function toISODate(d: Date) {
  return format(d, "yyyy-MM-dd")
}

export function fromISODate(s?: string): Date | undefined {
  if (!s) return undefined
  const d = parseISO(s)
  return isValid(d) ? d : undefined
}

export function formatDate(s?: string, pattern = "EEE, MMM d") {
  const d = fromISODate(s)
  return d ? format(d, pattern) : "—"
}

export function formatDateLong(s?: string) {
  return formatDate(s, "EEEE, MMMM d, yyyy")
}

export function formatTime(t?: string) {
  if (!t) return ""
  const [h, m] = t.split(":").map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return format(d, "h:mm a")
}

/** Number of 24h rental days (minimum 1) between two ISO dates */
export function rentalDays(from?: string, to?: string): number | null {
  const a = fromISODate(from)
  const b = fromISODate(to)
  if (!a || !b) return null
  const diff = differenceInCalendarDays(b, a)
  return diff < 1 ? 1 : diff
}

export function formatRange(from?: string, to?: string) {
  if (!from || !to) return "Add dates"
  return `${formatDate(from, "MMM d")} – ${formatDate(to, "MMM d")}`
}

export function pluralize(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function maskCard(last4: string) {
  return `•••• ${last4}`
}
