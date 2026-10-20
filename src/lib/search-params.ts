import type {
  CarCategory,
  CarSearchParams,
  FuelType,
  RentalParams,
  SortKey,
  Transmission,
} from "@/types"
import { DEFAULT_PICKUP_TIME, DEFAULT_RETURN_TIME, PAGE_SIZE } from "@/lib/constants"

/**
 * The URL is the single source of truth for a search. These helpers convert
 * between `URLSearchParams` and typed objects so pages never parse by hand.
 *
 *   /cars?pickup=orlando&from=2026-11-02&to=2026-11-05&type=suv,minivan&sort=price-asc
 */

const list = (sp: URLSearchParams, key: string) =>
  (sp.get(key) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

const num = (v: string | null) => {
  if (v === null || v === "") return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

const SORTS: SortKey[] = ["recommended", "price-asc", "price-desc", "rating"]

export function parseRental(sp: URLSearchParams): RentalParams {
  const pickup = sp.get("pickup") ?? undefined
  return {
    pickup,
    dropoff: sp.get("dropoff") ?? pickup,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    pickupTime: sp.get("pt") ?? DEFAULT_PICKUP_TIME,
    returnTime: sp.get("rt") ?? DEFAULT_RETURN_TIME,
  }
}

export function parseCarSearch(sp: URLSearchParams): CarSearchParams {
  const sort = sp.get("sort") as SortKey | null
  return {
    ...parseRental(sp),
    categories: list(sp, "type") as CarCategory[],
    transmissions: list(sp, "trans") as Transmission[],
    fuels: list(sp, "fuel") as FuelType[],
    brands: list(sp, "brand"),
    features: list(sp, "feat"),
    seats: num(sp.get("seats")),
    minPrice: num(sp.get("min")),
    maxPrice: num(sp.get("max")),
    q: sp.get("q") ?? undefined,
    sort: sort && SORTS.includes(sort) ? sort : "recommended",
    page: 1,
    pageSize: PAGE_SIZE,
  }
}

/** Rental part only – used when navigating card → details → checkout */
export function rentalToSearchParams(r: Partial<RentalParams>): URLSearchParams {
  const sp = new URLSearchParams()
  if (r.pickup) sp.set("pickup", r.pickup)
  if (r.dropoff && r.dropoff !== r.pickup) sp.set("dropoff", r.dropoff)
  if (r.from) sp.set("from", r.from)
  if (r.to) sp.set("to", r.to)
  if (r.pickupTime && r.pickupTime !== DEFAULT_PICKUP_TIME) sp.set("pt", r.pickupTime)
  if (r.returnTime && r.returnTime !== DEFAULT_RETURN_TIME) sp.set("rt", r.returnTime)
  return sp
}

export function rentalQuery(r: Partial<RentalParams>): string {
  const s = rentalToSearchParams(r).toString()
  return s ? `?${s}` : ""
}

/** Full search (rental + filters + sort) */
export function carSearchToSearchParams(p: Partial<CarSearchParams>): URLSearchParams {
  const sp = rentalToSearchParams(p)
  const join = (key: string, values?: string[]) => {
    if (values && values.length) sp.set(key, values.join(","))
  }
  join("type", p.categories)
  join("trans", p.transmissions)
  join("fuel", p.fuels)
  join("brand", p.brands)
  join("feat", p.features)
  if (p.seats) sp.set("seats", String(p.seats))
  if (p.minPrice !== undefined) sp.set("min", String(p.minPrice))
  if (p.maxPrice !== undefined) sp.set("max", String(p.maxPrice))
  if (p.q) sp.set("q", p.q)
  if (p.sort && p.sort !== "recommended") sp.set("sort", p.sort)
  return sp
}

/** Number of active filter groups (for the mobile "Filters (3)" badge) */
export function countActiveFilters(p: CarSearchParams): number {
  return (
    (p.categories.length ? 1 : 0) +
    (p.transmissions.length ? 1 : 0) +
    (p.fuels.length ? 1 : 0) +
    (p.brands.length ? 1 : 0) +
    (p.features.length ? 1 : 0) +
    (p.seats ? 1 : 0) +
    (p.minPrice !== undefined || p.maxPrice !== undefined ? 1 : 0) +
    (p.q ? 1 : 0)
  )
}
