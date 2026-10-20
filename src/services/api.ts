/**
 * Mock backend.
 *
 * Every function returns a Promise that resolves after a realistic delay, may
 * reject with an `ApiError`, and returns cloned data – exactly like a real
 * HTTP client would. To go live, replace the body of each function with a
 * `fetch`/axios call to your API and keep the signatures.
 */
import { format } from "date-fns"

import type {
  Booking,
  Car,
  CarFacets,
  CarSearchParams,
  CarSearchResult,
  CouponResult,
  CreateBookingPayload,
  Deal,
  Extra,
  Faq,
  HomeStats,
  Location,
  LocationWithStats,
  Protection,
  Review,
  ReviewSummary,
  Testimonial,
  User,
  CarCategory,
  FuelType,
} from "@/types"
import { calculateQuote } from "@/lib/pricing"
import { rentalDays } from "@/lib/format"
import { locationLabel } from "@/lib/location"
import { ApiError, fast, respond } from "@/mocks/network"
import {
  carSnapshot,
  cars,
  deals,
  extras,
  faqs,
  findCar,
  findLocation,
  generateRef,
  locations,
  normalizeBooking,
  protections,
  readBookings,
  readUsers,
  reviews,
  testimonials,
  writeBookings,
  writeSessionUser,
  writeUsers,
  DEMO_EMAIL,
  demoUser,
} from "@/mocks/db"

/* ------------------------------------------------------------------ */
/* Cars                                                                */
/* ------------------------------------------------------------------ */

function matchesQuery(car: Car, q?: string) {
  if (!q) return true
  const s = q.toLowerCase()
  return [car.name, car.brand, car.categoryLabel, car.fuel].some((v) => v.toLowerCase().includes(s))
}

function count(values: string[]) {
  return values.reduce<Record<string, number>>((acc, v) => {
    acc[v] = (acc[v] ?? 0) + 1
    return acc
  }, {})
}

function buildFacets(base: Car[]): CarFacets {
  const prices = base.map((c) => c.pricePerDay)
  return {
    categories: count(base.map((c) => c.category)),
    transmissions: count(base.map((c) => c.transmission)),
    fuels: count(base.map((c) => c.fuel)),
    brands: count(base.map((c) => c.brand)),
    features: count(base.flatMap((c) => c.features)),
    priceMin: prices.length ? Math.floor(Math.min(...prices)) : 0,
    priceMax: prices.length ? Math.ceil(Math.max(...prices)) : 0,
  }
}

function recommendedScore(c: Car) {
  return (c.featured ? 3 : 0) + (c.popular ? 2 : 0) + c.rating
}

function searchCars(p: CarSearchParams): CarSearchResult {
  const base = cars.filter(
    (c) => (!p.pickup || c.locations.includes(p.pickup)) && matchesQuery(c, p.q),
  )
  const facets = buildFacets(base)

  const filtered = base.filter(
    (c) =>
      (!p.categories.length || p.categories.includes(c.category)) &&
      (!p.transmissions.length || p.transmissions.includes(c.transmission)) &&
      (!p.fuels.length || p.fuels.includes(c.fuel)) &&
      (!p.brands.length || p.brands.includes(c.brand)) &&
      (!p.features.length || p.features.every((f) => c.features.includes(f))) &&
      (!p.seats || c.seats >= p.seats) &&
      (p.minPrice === undefined || c.pricePerDay >= p.minPrice) &&
      (p.maxPrice === undefined || c.pricePerDay <= p.maxPrice),
  )

  const sorted = [...filtered].sort((a, b) => {
    switch (p.sort) {
      case "price-asc":
        return a.pricePerDay - b.pricePerDay
      case "price-desc":
        return b.pricePerDay - a.pricePerDay
      case "rating":
        return b.rating - a.rating || b.reviewCount - a.reviewCount
      default:
        return recommendedScore(b) - recommendedScore(a) || a.pricePerDay - b.pricePerDay
    }
  })

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / p.pageSize))
  const page = Math.min(Math.max(1, p.page), totalPages)

  return {
    items: sorted.slice((page - 1) * p.pageSize, page * p.pageSize),
    total,
    page,
    pageSize: p.pageSize,
    totalPages,
    facets,
  }
}

const carsApi = {
  search: (params: CarSearchParams) => respond(() => searchCars(params)),

  get: (id: string) =>
    respond(() => {
      const car = findCar(id)
      if (!car) throw new ApiError("We couldn't find that car.", 404)
      return car
    }),

  getMany: (ids: string[]) =>
    respond(() => ids.map((id) => findCar(id)).filter((c): c is Car => Boolean(c)), fast),

  featured: () =>
    respond(() =>
      [...cars]
        .filter((c) => c.featured || c.popular)
        .sort((a, b) => recommendedScore(b) - recommendedScore(a))
        .slice(0, 8),
    ),

  similar: (id: string) =>
    respond(() => {
      const car = findCar(id)
      if (!car) return []
      return cars
        .filter((c) => c.id !== id)
        .map((c) => ({
          car: c,
          score:
            (c.category === car.category ? 10 : 0) -
            Math.abs(c.pricePerDay - car.pricePerDay) / 10 +
            (c.fuel === car.fuel ? 1 : 0),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map((x) => x.car)
    }),
}

/* ------------------------------------------------------------------ */
/* Locations                                                           */
/* ------------------------------------------------------------------ */

function withStats(l: Location): LocationWithStats {
  const available = cars.filter((c) => c.locations.includes(l.slug))
  return {
    ...l,
    carCount: available.length,
    fromPrice: available.length ? Math.min(...available.map((c) => c.pricePerDay)) : 0,
  }
}

const locationsApi = {
  list: () => respond(() => locations.map(withStats)),

  /** Lightweight list for pickers */
  options: () => respond(() => locations, fast),

  get: (slug: string) =>
    respond(() => {
      const l = findLocation(slug)
      if (!l) throw new ApiError("We couldn't find that location.", 404)
      return withStats(l)
    }),
}

/* ------------------------------------------------------------------ */
/* Reviews, deals, content                                             */
/* ------------------------------------------------------------------ */

function summarize(car: Car, list: Review[]): ReviewSummary {
  const sample = list.length || 1
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
  for (const r of list) dist[r.rating as 1 | 2 | 3 | 4 | 5] += 1
  ;([1, 2, 3, 4, 5] as const).forEach((k) => {
    dist[k] = Math.round((dist[k] / sample) * car.reviewCount)
  })
  return { average: car.rating, total: car.reviewCount, distribution: dist }
}

const reviewsApi = {
  forCar: (carId: string) =>
    respond(() => {
      const car = findCar(carId)
      if (!car) throw new ApiError("We couldn't find that car.", 404)
      const list = reviews.filter((r) => r.carId === carId)
      return { reviews: list, summary: summarize(car, list) }
    }),
}

export function evaluateCoupon(
  code: string,
  ctx: { days?: number; category?: CarCategory; fuel?: FuelType } = {},
): CouponResult {
  const normalized = code.trim().toUpperCase()
  const deal = deals.find((d) => d.code === normalized)
  const fail = (message: string): CouponResult => ({ valid: false, code: normalized, percent: 0, message })

  if (!normalized) return fail("Enter a promo code.")
  if (!deal) return fail("That code isn't valid.")
  if (deal.validUntil < format(new Date(), "yyyy-MM-dd")) return fail("That code has expired.")
  if (ctx.days && ctx.days < deal.minDays) return fail(`This code needs a rental of ${deal.minDays}+ days.`)
  if (deal.categories.length && ctx.category && !deal.categories.includes(ctx.category))
    return fail(`This code only applies to ${deal.categories.join(" & ")} rentals.`)
  if (deal.fuels && ctx.fuel && !deal.fuels.includes(ctx.fuel))
    return fail(`This code only applies to ${deal.fuels.join(" & ")} cars.`)

  return { valid: true, code: normalized, percent: deal.discountPercent, message: `${deal.title} applied.` }
}

const dealsApi = {
  list: () => respond((): Deal[] => deals),
  validate: (code: string, ctx: { days?: number; category?: CarCategory; fuel?: FuelType }) =>
    respond(() => evaluateCoupon(code, ctx), fast),
}

const contentApi = {
  testimonials: () => respond((): Testimonial[] => testimonials),
  faqs: () => respond((): Faq[] => faqs),
  extras: () => respond((): Extra[] => extras, fast),
  protections: () => respond((): Protection[] => protections, fast),
  stats: () =>
    respond(
      (): HomeStats => ({
        cars: cars.length,
        locations: locations.length,
        averageRating: Math.round((cars.reduce((s, c) => s + c.rating, 0) / cars.length) * 10) / 10,
        customers: "250,000+",
      }),
      fast,
    ),
}

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */

const normalizeRef = (ref: string) => ref.trim().toUpperCase()

const bookingsApi = {
  create: (payload: CreateBookingPayload) =>
    respond(
      () => {
        const car = findCar(payload.carId)
        if (!car) throw new ApiError("We couldn't find that car.", 404)

        const { rental, driver, payment } = payload
        const pickup = findLocation(rental.pickup)
        const dropoff = findLocation(rental.dropoff ?? rental.pickup)
        if (!pickup || !dropoff || !rental.from || !rental.to) {
          throw new ApiError("Choose a pick-up location and your dates before booking.", 400)
        }
        if (!car.locations.includes(pickup.slug)) {
          throw new ApiError("This car isn't available at the selected location.", 409)
        }

        if (!driver.firstName.trim() || !driver.lastName.trim()) throw new ApiError("Enter the driver's full name.", 400)
        if (!/^\S+@\S+\.\S+$/.test(driver.email)) throw new ApiError("Enter a valid email address.", 400)
        if (driver.phone.replace(/\D/g, "").length < 7) throw new ApiError("Enter a valid phone number.", 400)

        const digits = payment.cardNumber.replace(/\s+/g, "")
        if (!/^\d{13,19}$/.test(digits)) throw new ApiError("Enter a valid card number.", 400)
        if (!/^\d{3,4}$/.test(payment.cvc)) throw new ApiError("Enter a valid security code.", 400)
        const exp = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(payment.expiry)
        if (!exp) throw new ApiError("Enter the card expiry as MM/YY.", 400)
        const expYear = 2000 + Number(exp[2])
        const expMonth = Number(exp[1])
        const now = new Date()
        if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
          throw new ApiError("That card has expired.", 400)
        }
        // Demo: this well-known test number is always declined
        if (digits === "4000000000000002") throw new ApiError("Your card was declined. Try a different card.", 402)

        const days = rentalDays(rental.from, rental.to) ?? 1

        const chosenExtras = payload.extras
          .filter((e) => e.qty > 0)
          .map((e) => ({ extra: extras.find((x) => x.id === e.id), qty: e.qty }))
          .filter((e): e is { extra: Extra; qty: number } => Boolean(e.extra))

        const protection = protections.find((p) => p.id === payload.protectionId) ?? protections[0]

        let coupon: Booking["coupon"]
        if (payload.couponCode) {
          const result = evaluateCoupon(payload.couponCode, { days, category: car.category, fuel: car.fuel })
          if (!result.valid) throw new ApiError(result.message, 400)
          coupon = { code: result.code, percent: result.percent }
        }

        const quote = calculateQuote({
          car,
          days,
          extras: chosenExtras,
          protection,
          couponPercent: coupon?.percent ?? 0,
          oneWay: pickup.slug !== dropoff.slug,
        })

        const booking: Booking = {
          ref: generateRef(),
          status: "confirmed",
          createdAt: new Date().toISOString(),
          userEmail: driver.email.trim().toLowerCase(),
          car: carSnapshot(car),
          pickup: {
            locationSlug: pickup.slug,
            locationName: locationLabel(pickup),
            date: rental.from,
            time: rental.pickupTime,
          },
          dropoff: {
            locationSlug: dropoff.slug,
            locationName: locationLabel(dropoff),
            date: rental.to,
            time: rental.returnTime,
          },
          days,
          driver,
          extras: chosenExtras.map(({ extra, qty }) => ({
            id: extra.id,
            name: extra.name,
            qty,
            total: extra.price * (extra.unit === "day" ? days : 1) * qty,
          })),
          protection: { id: protection.id, name: protection.name, total: quote.protectionTotal },
          coupon,
          quote,
          paymentLast4: digits.slice(-4),
        }

        writeBookings([booking, ...readBookings()])
        return booking
      },
      { min: 1400, max: 2200 },
    ),

  get: (ref: string, email?: string) =>
    respond(() => {
      const found = readBookings().find((b) => b.ref === normalizeRef(ref))
      if (!found || (email && found.userEmail !== email.trim().toLowerCase())) {
        throw new ApiError("We couldn't find a booking with those details.", 404)
      }
      return normalizeBooking(found)
    }),

  list: (email: string) =>
    respond(() =>
      readBookings()
        .filter((b) => b.userEmail === email.trim().toLowerCase())
        .map(normalizeBooking)
        .sort((a, b) => (a.pickup.date < b.pickup.date ? 1 : -1)),
    ),

  cancel: (ref: string) =>
    respond(
      () => {
        const all = readBookings()
        const idx = all.findIndex((b) => b.ref === normalizeRef(ref))
        if (idx === -1) throw new ApiError("We couldn't find that booking.", 404)
        const current = normalizeBooking(all[idx])
        if (current.status === "completed") throw new ApiError("Completed bookings can't be cancelled.", 400)
        all[idx] = { ...all[idx], status: "cancelled" }
        writeBookings(all)
        return all[idx]
      },
      { min: 700, max: 1200 },
    ),
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

const nameFromEmail = (email: string) =>
  email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ") || "Traveller"

const authApi = {
  /** Demo mode: any email + a password of 6+ characters signs you in */
  login: (input: { email: string; password: string }) =>
    respond(
      () => {
        const email = input.email.trim().toLowerCase()
        if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError("Enter a valid email address.", 400)
        if (input.password.length < 6) throw new ApiError("Password must be at least 6 characters.", 400)

        const users = readUsers()
        let user = users[email]
        if (!user) {
          user = {
            id: `u_${Date.now()}`,
            name: nameFromEmail(email),
            email,
            memberSince: format(new Date(), "yyyy-MM-dd"),
            tier: "Bronze",
          }
          users[email] = user
          writeUsers(users)
        }
        writeSessionUser(user)
        return user
      },
      { min: 700, max: 1200, reliable: true },
    ),

  loginDemo: () =>
    respond(
      () => {
        writeSessionUser(demoUser)
        return demoUser
      },
      { min: 500, max: 800, reliable: true },
    ),

  register: (input: { name: string; email: string; password: string }) =>
    respond(
      () => {
        const email = input.email.trim().toLowerCase()
        if (input.name.trim().length < 2) throw new ApiError("Enter your full name.", 400)
        if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError("Enter a valid email address.", 400)
        if (input.password.length < 6) throw new ApiError("Password must be at least 6 characters.", 400)

        const users = readUsers()
        if (users[email]) throw new ApiError("An account with this email already exists. Try signing in.", 409)

        const user: User = {
          id: `u_${Date.now()}`,
          name: input.name.trim(),
          email,
          memberSince: format(new Date(), "yyyy-MM-dd"),
          tier: "Bronze",
        }
        users[email] = user
        writeUsers(users)
        writeSessionUser(user)
        return user
      },
      { min: 800, max: 1300, reliable: true },
    ),

  logout: () =>
    respond(
      () => {
        writeSessionUser(null)
        return true
      },
      { min: 100, max: 200, reliable: true },
    ),

  updateProfile: (current: User, patch: Partial<Pick<User, "name" | "phone">>) =>
    respond(
      () => {
        const users = readUsers()
        const next: User = { ...current, ...patch, name: (patch.name ?? current.name).trim() || current.name }
        users[current.email] = next
        writeUsers(users)
        writeSessionUser(next)
        return next
      },
      { min: 500, max: 900, reliable: true },
    ),
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

const miscApi = {
  subscribe: (email: string) =>
    respond(() => {
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) throw new ApiError("Enter a valid email address.", 400)
      return { ok: true }
    }),

  contact: (input: { name: string; email: string; topic: string; message: string }) =>
    respond(
      () => {
        if (!input.name.trim()) throw new ApiError("Tell us your name.", 400)
        if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) throw new ApiError("Enter a valid email address.", 400)
        if (input.message.trim().length < 10) throw new ApiError("Please write a few more words so we can help.", 400)
        return { ok: true, ticket: `TKT-${Math.floor(100000 + Math.random() * 900000)}` }
      },
      { min: 800, max: 1400 },
    ),
}

export const api = {
  cars: carsApi,
  locations: locationsApi,
  reviews: reviewsApi,
  deals: dealsApi,
  content: contentApi,
  bookings: bookingsApi,
  auth: authApi,
  misc: miscApi,
}

export { ApiError, DEMO_EMAIL }
