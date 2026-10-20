import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { api } from "@/services/api"
import type { CarCategory, CarSearchParams, CreateBookingPayload, FuelType } from "@/types"

/** Central query-key factory so invalidation stays predictable */
export const qk = {
  cars: {
    all: ["cars"] as const,
    search: (key: unknown) => ["cars", "search", key] as const,
    detail: (id: string) => ["cars", "detail", id] as const,
    featured: ["cars", "featured"] as const,
    similar: (id: string) => ["cars", "similar", id] as const,
    many: (ids: string[]) => ["cars", "many", ids] as const,
    reviews: (id: string) => ["cars", "reviews", id] as const,
  },
  locations: {
    all: ["locations"] as const,
    list: ["locations", "list"] as const,
    options: ["locations", "options"] as const,
    detail: (slug: string) => ["locations", "detail", slug] as const,
  },
  deals: ["deals"] as const,
  testimonials: ["testimonials"] as const,
  faqs: ["faqs"] as const,
  extras: ["extras"] as const,
  protections: ["protections"] as const,
  stats: ["stats"] as const,
  bookings: {
    all: ["bookings"] as const,
    list: (email: string) => ["bookings", "list", email] as const,
    detail: (ref: string, email?: string) => ["bookings", "detail", ref, email ?? ""] as const,
  },
}

/* ------------------------------------------------------------------ */
/* Cars                                                                */
/* ------------------------------------------------------------------ */

export function useCarSearch(params: CarSearchParams) {
  // Only the things the "server" actually filters on belong in the cache key –
  // changing dates or times must not refetch the list.
  const key = {
    pickup: params.pickup,
    categories: params.categories,
    transmissions: params.transmissions,
    fuels: params.fuels,
    brands: params.brands,
    features: params.features,
    seats: params.seats,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    q: params.q,
    sort: params.sort,
    pageSize: params.pageSize,
  }

  return useInfiniteQuery({
    queryKey: qk.cars.search(key),
    queryFn: ({ pageParam }) => api.cars.search({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  })
}

export const useCar = (id?: string) =>
  useQuery({
    queryKey: qk.cars.detail(id ?? ""),
    queryFn: () => api.cars.get(id!),
    enabled: Boolean(id),
    retry: (count, error) => (error as { status?: number })?.status !== 404 && count < 1,
  })

export const useFeaturedCars = () =>
  useQuery({ queryKey: qk.cars.featured, queryFn: api.cars.featured })

export const useSimilarCars = (id?: string) =>
  useQuery({
    queryKey: qk.cars.similar(id ?? ""),
    queryFn: () => api.cars.similar(id!),
    enabled: Boolean(id),
  })

export const useCarsByIds = (ids: string[]) =>
  useQuery({
    queryKey: qk.cars.many(ids),
    queryFn: () => api.cars.getMany(ids),
    placeholderData: keepPreviousData,
  })

export const useCarReviews = (id?: string) =>
  useQuery({
    queryKey: qk.cars.reviews(id ?? ""),
    queryFn: () => api.reviews.forCar(id!),
    enabled: Boolean(id),
  })

/* ------------------------------------------------------------------ */
/* Locations & content                                                 */
/* ------------------------------------------------------------------ */

export const useLocations = () =>
  useQuery({ queryKey: qk.locations.list, queryFn: api.locations.list, staleTime: 5 * 60_000 })

export const useLocationOptions = () =>
  useQuery({ queryKey: qk.locations.options, queryFn: api.locations.options, staleTime: 10 * 60_000 })

export const useLocation = (slug?: string) =>
  useQuery({
    queryKey: qk.locations.detail(slug ?? ""),
    queryFn: () => api.locations.get(slug!),
    enabled: Boolean(slug),
    retry: (count, error) => (error as { status?: number })?.status !== 404 && count < 1,
  })

export const useDeals = () => useQuery({ queryKey: qk.deals, queryFn: api.deals.list })
export const useTestimonials = () =>
  useQuery({ queryKey: qk.testimonials, queryFn: api.content.testimonials })
export const useFaqs = () => useQuery({ queryKey: qk.faqs, queryFn: api.content.faqs })
export const useExtras = () => useQuery({ queryKey: qk.extras, queryFn: api.content.extras })
export const useProtections = () =>
  useQuery({ queryKey: qk.protections, queryFn: api.content.protections })
export const useHomeStats = () => useQuery({ queryKey: qk.stats, queryFn: api.content.stats })

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */

export const useBooking = (ref?: string, email?: string) =>
  useQuery({
    queryKey: qk.bookings.detail(ref ?? "", email),
    queryFn: () => api.bookings.get(ref!, email),
    enabled: Boolean(ref),
    retry: (count, error) => (error as { status?: number })?.status !== 404 && count < 1,
  })

export const useMyBookings = (email?: string) =>
  useQuery({
    queryKey: qk.bookings.list(email ?? ""),
    queryFn: () => api.bookings.list(email!),
    enabled: Boolean(email),
  })

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => api.bookings.create(payload),
    onSuccess: (booking) => {
      qc.setQueryData(qk.bookings.detail(booking.ref), booking)
      qc.invalidateQueries({ queryKey: qk.bookings.all })
    },
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ref: string) => api.bookings.cancel(ref),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.bookings.all }),
  })
}

export function useLookupBooking() {
  return useMutation({
    mutationFn: ({ ref, email }: { ref: string; email: string }) => api.bookings.get(ref, email),
  })
}

/* ------------------------------------------------------------------ */
/* Small mutations                                                     */
/* ------------------------------------------------------------------ */

export const useValidateCoupon = () =>
  useMutation({
    mutationFn: ({
      code,
      ...ctx
    }: {
      code: string
      days?: number
      category?: CarCategory
      fuel?: FuelType
    }) => api.deals.validate(code, ctx),
  })

export const useSubscribe = () =>
  useMutation({ mutationFn: (email: string) => api.misc.subscribe(email) })

export const useSendContact = () =>
  useMutation({ mutationFn: api.misc.contact })
