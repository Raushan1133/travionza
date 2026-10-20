import type { Car, Extra, Protection, Quote, QuoteLine } from "@/types"
import { AIRPORT_FEE_PER_RENTAL, ONE_WAY_FEE, SERVICE_FEE_PER_DAY, TAX_RATE } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"

interface QuoteInput {
  car: Pick<Car, "pricePerDay" | "deposit">
  days: number
  extras?: { extra: Extra; qty: number }[]
  protection?: Protection
  couponPercent?: number
  oneWay?: boolean
  airportPickup?: boolean
}

const round = (n: number) => Math.round(n * 100) / 100

/**
 * Pure pricing function – lives on the "client" for the mock, but the same
 * shape would normally come back from `POST /quotes`.
 */
export function calculateQuote({
  car,
  days,
  extras = [],
  protection,
  couponPercent = 0,
  oneWay = false,
  airportPickup = true,
}: QuoteInput): Quote {
  const lines: QuoteLine[] = []

  const baseTotal = round(car.pricePerDay * days)
  lines.push({
    label: `Car rental`,
    detail: `${days} day${days === 1 ? "" : "s"} × ${formatCurrency(car.pricePerDay)}`,
    amount: baseTotal,
  })

  const extrasTotal = round(
    extras.reduce((sum, { extra, qty }) => sum + extra.price * (extra.unit === "day" ? days : 1) * qty, 0),
  )
  for (const { extra, qty } of extras) {
    if (qty <= 0) continue
    lines.push({
      label: qty > 1 ? `${extra.name} × ${qty}` : extra.name,
      detail: extra.unit === "day" ? `${formatCurrency(extra.price)} / day` : "per rental",
      amount: round(extra.price * (extra.unit === "day" ? days : 1) * qty),
    })
  }

  const protectionTotal = round((protection?.pricePerDay ?? 0) * days)
  if (protection && protection.pricePerDay > 0) {
    lines.push({
      label: `${protection.name} protection`,
      detail: `${formatCurrency(protection.pricePerDay)} / day`,
      amount: protectionTotal,
    })
  }

  const discount = round(baseTotal * (couponPercent / 100))
  if (discount > 0) {
    lines.push({ label: `Promo code (${couponPercent}% off)`, amount: -discount })
  }

  const fees = round(
    SERVICE_FEE_PER_DAY * days + (airportPickup ? AIRPORT_FEE_PER_RENTAL : 0) + (oneWay ? ONE_WAY_FEE : 0),
  )
  lines.push({ label: "Fees", detail: oneWay ? "Service, airport & one-way fee" : "Service & airport fees", amount: fees })

  const taxable = baseTotal + extrasTotal + protectionTotal - discount + fees
  const taxes = round(taxable * TAX_RATE)
  lines.push({ label: "Taxes", detail: `${(TAX_RATE * 100).toFixed(2)}%`, amount: taxes })

  const total = round(taxable + taxes)

  return {
    days,
    baseRate: car.pricePerDay,
    baseTotal,
    extrasTotal,
    protectionTotal,
    discount,
    fees,
    taxes,
    total,
    deposit: car.deposit,
    lines,
  }
}

/** Quick "estimated total" used on cards before extras are chosen */
export function estimateTotal(pricePerDay: number, days: number) {
  const base = pricePerDay * days
  const fees = SERVICE_FEE_PER_DAY * days + AIRPORT_FEE_PER_RENTAL
  return round((base + fees) * (1 + TAX_RATE))
}
