/* ------------------------------------------------------------------ */
/* Domain types – mirror what a real backend would return              */
/* ------------------------------------------------------------------ */

export type CarCategory =
  | "economy"
  | "compact"
  | "sedan"
  | "suv"
  | "minivan"
  | "luxury"
  | "convertible"
  | "truck"

export type CarBody =
  | "hatchback"
  | "sedan"
  | "suv"
  | "van"
  | "luxury"
  | "convertible"
  | "pickup"

export type Transmission = "automatic" | "manual"
export type FuelType = "petrol" | "diesel" | "hybrid" | "electric"

export interface CarSpecs {
  engine: string
  fuelEconomy: string
  drivetrain: string
  luggage: string
  mileage: string
  fuelPolicy: string
}

export interface Car {
  id: string
  slug: string
  name: string
  brand: string
  model: string
  year: number
  category: CarCategory
  categoryLabel: string
  body: CarBody
  transmission: Transmission
  fuel: FuelType
  seats: number
  doors: number
  bags: number
  pricePerDay: number
  originalPricePerDay?: number
  rating: number
  reviewCount: number
  /** Hex colour used by the illustrated placeholder */
  color: string
  /** Optional real photos – when present they replace the illustration */
  images?: string[]
  similarTo: string
  description: string
  features: string[]
  specs: CarSpecs
  deposit: number
  minAge: number
  freeCancellation: boolean
  /** Location slugs where this car can be picked up */
  locations: string[]
  popular: boolean
  featured: boolean
  badge?: string
}

export interface Branch {
  id: string
  name: string
  type: "airport" | "downtown"
  address: string
  hours: string
}

export interface Location {
  slug: string
  city: string
  state: string
  country: string
  airportCode: string
  airportName: string
  popular: boolean
  hue: number
  tagline: string
  description: string
  highlights: string[]
  phone: string
  branches: Branch[]
}

export interface LocationWithStats extends Location {
  carCount: number
  fromPrice: number
}

export interface Review {
  id: string
  carId: string
  author: string
  rating: number
  title: string
  body: string
  date: string
  tripType: string
  helpful: number
}

export interface ReviewSummary {
  average: number
  total: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}

export interface Deal {
  id: string
  code: string
  title: string
  description: string
  discountPercent: number
  minDays: number
  categories: CarCategory[]
  fuels?: FuelType[]
  validUntil: string
  badge: string
  hue: number
  terms: string[]
}

export interface Testimonial {
  id: string
  name: string
  city: string
  rating: number
  trip: string
  text: string
}

export interface Faq {
  id: string
  category: string
  question: string
  answer: string
}

export interface Extra {
  id: string
  name: string
  description: string
  price: number
  unit: "day" | "rental"
  maxQty: number
  icon: string
  popular: boolean
}

export interface Protection {
  id: string
  name: string
  description: string
  pricePerDay: number
  excess: number
  included: string[]
  recommended?: boolean
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

export type SortKey = "recommended" | "price-asc" | "price-desc" | "rating"

/** The "where & when" part of a search – shared across search, details and checkout */
export interface RentalParams {
  pickup?: string
  dropoff?: string
  /** yyyy-MM-dd */
  from?: string
  /** yyyy-MM-dd */
  to?: string
  /** HH:mm */
  pickupTime: string
  returnTime: string
}

export interface CarFilters {
  categories: CarCategory[]
  transmissions: Transmission[]
  fuels: FuelType[]
  brands: string[]
  features: string[]
  seats?: number
  minPrice?: number
  maxPrice?: number
  q?: string
}

export interface CarSearchParams extends RentalParams, CarFilters {
  sort: SortKey
  page: number
  pageSize: number
}

export interface CarFacets {
  categories: Record<string, number>
  transmissions: Record<string, number>
  fuels: Record<string, number>
  brands: Record<string, number>
  features: Record<string, number>
  priceMin: number
  priceMax: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CarSearchResult extends Paginated<Car> {
  facets: CarFacets
}

/* ------------------------------------------------------------------ */
/* Pricing & bookings                                                  */
/* ------------------------------------------------------------------ */

export interface QuoteLine {
  label: string
  amount: number
  detail?: string
}

export interface Quote {
  days: number
  baseRate: number
  baseTotal: number
  extrasTotal: number
  protectionTotal: number
  discount: number
  fees: number
  taxes: number
  total: number
  deposit: number
  lines: QuoteLine[]
}

export interface DriverDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseCountry: string
  age: string
  flightNumber?: string
  notes?: string
}

export type BookingStatus = "confirmed" | "completed" | "cancelled"

export interface BookingExtra {
  id: string
  name: string
  qty: number
  total: number
}

export interface BookingStop {
  locationSlug: string
  locationName: string
  date: string
  time: string
}

export interface Booking {
  ref: string
  status: BookingStatus
  createdAt: string
  userEmail: string
  car: Pick<Car, "id" | "name" | "similarTo" | "category" | "categoryLabel" | "body" | "color" | "seats" | "bags" | "transmission" | "fuel">
  pickup: BookingStop
  dropoff: BookingStop
  days: number
  driver: DriverDetails
  extras: BookingExtra[]
  protection: { id: string; name: string; total: number }
  coupon?: { code: string; percent: number }
  quote: Quote
  paymentLast4: string
}

export interface CreateBookingPayload {
  carId: string
  rental: RentalParams
  driver: DriverDetails
  extras: { id: string; qty: number }[]
  protectionId: string
  couponCode?: string
  payment: { cardNumber: string; name: string; expiry: string; cvc: string }
}

export interface CouponResult {
  valid: boolean
  code: string
  percent: number
  message: string
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  memberSince: string
  tier: "Bronze" | "Silver" | "Gold"
}

export interface HomeStats {
  cars: number
  locations: number
  averageRating: number
  customers: string
}
