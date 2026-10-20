import { addDays, format } from "date-fns"

import carsData from "@/mocks/data/cars.json"
import locationsData from "@/mocks/data/locations.json"
import reviewsData from "@/mocks/data/reviews.json"
import dealsData from "@/mocks/data/deals.json"
import testimonialsData from "@/mocks/data/testimonials.json"
import faqsData from "@/mocks/data/faqs.json"
import extrasData from "@/mocks/data/extras.json"
import protectionsData from "@/mocks/data/protections.json"

import type { Booking, Car, Deal, Extra, Faq, Location, Protection, Review, Testimonial, User } from "@/types"
import { STORAGE_KEYS } from "@/lib/constants"
import { readJSON, writeJSON } from "@/lib/storage"
import { calculateQuote } from "@/lib/pricing"
import { locationLabel } from "@/lib/location"

/* ------------------------------------------------------------------ */
/* Static "tables" – loaded from JSON                                  */
/* ------------------------------------------------------------------ */

export const cars = carsData as unknown as Car[]
export const locations = locationsData as unknown as Location[]
export const reviews = reviewsData as unknown as Review[]
export const deals = dealsData as unknown as Deal[]
export const testimonials = testimonialsData as unknown as Testimonial[]
export const faqs = faqsData as unknown as Faq[]
export const extras = extrasData as unknown as Extra[]
export const protections = protectionsData as unknown as Protection[]

export const findCar = (id: string) => cars.find((c) => c.id === id)
export const findLocation = (slug?: string) => locations.find((l) => l.slug === slug)

/* ------------------------------------------------------------------ */
/* Bookings – persisted in localStorage so they survive a refresh      */
/* ------------------------------------------------------------------ */

export const DEMO_EMAIL = "demo@driveease.com"

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generateRef() {
  let s = ""
  for (let i = 0; i < 6; i++) s += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)]
  return `DE-${s}`
}

export function carSnapshot(car: Car): Booking["car"] {
  return {
    id: car.id,
    name: car.name,
    similarTo: car.similarTo,
    category: car.category,
    categoryLabel: car.categoryLabel,
    body: car.body,
    color: car.color,
    seats: car.seats,
    bags: car.bags,
    transmission: car.transmission,
    fuel: car.fuel,
  }
}

function seedBooking(
  ref: string,
  status: Booking["status"],
  carId: string,
  pickupSlug: string,
  startOffsetDays: number,
  days: number,
  dropoffSlug = pickupSlug,
): Booking {
  const car = findCar(carId)!
  const pickupLoc = findLocation(pickupSlug)!
  const dropLoc = findLocation(dropoffSlug)!
  const start = addDays(new Date(), startOffsetDays)
  const end = addDays(start, days)
  const protection = protections.find((p) => p.id === "standard")!
  const quote = calculateQuote({ car, days, protection, oneWay: pickupSlug !== dropoffSlug })

  return {
    ref,
    status,
    createdAt: addDays(start, -14).toISOString(),
    userEmail: DEMO_EMAIL,
    car: carSnapshot(car),
    pickup: {
      locationSlug: pickupLoc.slug,
      locationName: locationLabel(pickupLoc),
      date: format(start, "yyyy-MM-dd"),
      time: "10:00",
    },
    dropoff: {
      locationSlug: dropLoc.slug,
      locationName: locationLabel(dropLoc),
      date: format(end, "yyyy-MM-dd"),
      time: "10:00",
    },
    days,
    driver: {
      firstName: "Alex",
      lastName: "Morgan",
      email: DEMO_EMAIL,
      phone: "+1 555 010 4242",
      licenseCountry: "United States",
      age: "25+",
    },
    extras: [],
    protection: { id: protection.id, name: protection.name, total: quote.protectionTotal },
    quote,
    paymentLast4: "4242",
  }
}

function seedBookings(): Booking[] {
  return [
    seedBooking("DE-7K2M9Q", "confirmed", "toyota-rav4", "orlando", 12, 5),
    seedBooking("DE-4TN8XB", "completed", "honda-civic", "los-angeles", -45, 4, "san-francisco"),
    seedBooking("DE-9HC3WD", "cancelled", "bmw-5-series", "miami", -20, 3),
  ]
}

export function readBookings(): Booking[] {
  const stored = readJSON<Booking[] | null>(STORAGE_KEYS.bookings, null)
  if (stored) return stored
  const seeded = seedBookings()
  writeJSON(STORAGE_KEYS.bookings, seeded)
  return seeded
}

export function writeBookings(list: Booking[]) {
  writeJSON(STORAGE_KEYS.bookings, list)
}

/** A confirmed booking whose drop-off date has passed is "completed" */
export function normalizeBooking(b: Booking): Booking {
  const today = format(new Date(), "yyyy-MM-dd")
  if (b.status === "confirmed" && b.dropoff.date < today) return { ...b, status: "completed" }
  return b
}

/* ------------------------------------------------------------------ */
/* Users & session                                                     */
/* ------------------------------------------------------------------ */

type UserMap = Record<string, User>

export const demoUser: User = {
  id: "u_demo",
  name: "Alex Morgan",
  email: DEMO_EMAIL,
  phone: "+1 555 010 4242",
  memberSince: "2024-03-14",
  tier: "Silver",
}

export function readUsers(): UserMap {
  const users = readJSON<UserMap>(STORAGE_KEYS.users, {})
  if (!users[DEMO_EMAIL]) users[DEMO_EMAIL] = demoUser
  return users
}

export function writeUsers(users: UserMap) {
  writeJSON(STORAGE_KEYS.users, users)
}

export function readSessionUser(): User | null {
  return readJSON<User | null>(STORAGE_KEYS.session, null)
}

export function writeSessionUser(user: User | null) {
  writeJSON(STORAGE_KEYS.session, user)
}
