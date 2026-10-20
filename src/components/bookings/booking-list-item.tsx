import { ArrowRight, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

import type { Booking } from "@/types"
import { StatusBadge } from "@/components/bookings/status-badge"
import { CarImage } from "@/components/common/car-image"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate, pluralize } from "@/lib/format"

export function BookingListItem({ booking }: { booking: Booking }) {
  const { car, pickup, dropoff } = booking
  return (
    <Link
      to={`/booking/${booking.ref}`}
      className="group flex flex-col gap-4 rounded-2xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center"
    >
      <div className="w-full overflow-hidden rounded-xl sm:w-44 sm:shrink-0">
        <CarImage carId={car.id} body={car.body} color={car.color} name={car.name} />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{car.name}</h3>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-xs text-muted-foreground">
          Ref <span className="font-mono font-medium text-foreground">{booking.ref}</span> · {pluralize(booking.days, "day")}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          {pickup.locationName}
          {dropoff.locationSlug !== pickup.locationSlug && (
            <>
              <ArrowRight className="size-3.5" /> {dropoff.locationName}
            </>
          )}
        </p>
        <p className="text-sm">
          {formatDate(pickup.date, "EEE, MMM d")} → {formatDate(dropoff.date, "EEE, MMM d, yyyy")}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 border-t pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
        <p className="text-xl font-bold tabular-nums">{formatCurrency(booking.quote.total)}</p>
        <span className="flex items-center gap-1 text-sm font-medium text-primary">
          View <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

export function BookingListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
          <Skeleton className="h-24 w-full rounded-xl sm:w-44" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}
