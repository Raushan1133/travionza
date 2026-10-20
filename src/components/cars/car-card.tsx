import { BadgeCheck, Luggage, Settings2, Users } from "lucide-react"
import { Link } from "react-router-dom"

import type { Car, RentalParams } from "@/types"
import { CarImage } from "@/components/common/car-image"
import { FavoriteButton } from "@/components/common/favorite-button"
import { Rating } from "@/components/common/rating"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FUEL_ICONS, FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/car-meta"
import { formatCurrency } from "@/lib/format"
import { estimateTotal } from "@/lib/pricing"
import { rentalQuery } from "@/lib/search-params"
import { cn } from "@/lib/utils"

export type CarCardView = "grid" | "list"

interface CarCardProps {
  car: Car
  rental?: Partial<RentalParams>
  days?: number | null
  view?: CarCardView
  className?: string
}

export function CarCard({ car, rental = {}, days, view = "grid", className }: CarCardProps) {
  const FuelIcon = FUEL_ICONS[car.fuel]
  const list = view === "list"
  const href = `/cars/${car.id}${rentalQuery(rental)}`

  const specs = [
    { icon: Users, label: `${car.seats} seats` },
    { icon: Luggage, label: `${car.bags} bags` },
    { icon: Settings2, label: TRANSMISSION_LABELS[car.transmission] },
    { icon: FuelIcon, label: FUEL_LABELS[car.fuel] },
  ]

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-2xl border bg-card transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        list ? "flex-col sm:flex-row" : "flex-col",
        className,
      )}
    >
      {/* The whole card is one link; the favourite button stops propagation */}
      <Link to={href} className="absolute inset-0 z-10" aria-label={`View ${car.name}`} />

      <div
        className={cn(
          "relative overflow-hidden",
          list ? "sm:w-72 sm:shrink-0" : "",
        )}
      >
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {car.badge && <Badge>{car.badge}</Badge>}
          <Badge variant="secondary">{car.categoryLabel}</Badge>
        </div>
        <FavoriteButton carId={car.id} carName={car.name} className="absolute right-3 top-3 z-20" />
        <CarImage
          carId={car.id}
          body={car.body}
          color={car.color}
          name={car.name}
          images={car.images}
          className={list ? "h-full min-h-44" : undefined}
          imgClassName="transition-transform duration-500 group-hover:scale-[1.05]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold leading-tight tracking-tight">{car.name}</h3>
            <Rating value={car.rating} count={car.reviewCount} className="shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground">{car.similarTo}</p>
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
          {specs.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-1.5">
              <Icon className="size-4" /> {label}
            </li>
          ))}
        </ul>

        {car.freeCancellation && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-success">
            <BadgeCheck className="size-4" /> Free cancellation
          </p>
        )}

        <div className={cn("mt-auto flex items-end justify-between gap-3 border-t pt-3", list && "sm:border-t-0 sm:pt-0")}>
          <div>
            <p className="flex items-baseline gap-1.5">
              {car.originalPricePerDay && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(car.originalPricePerDay, { whole: true })}
                </span>
              )}
              <span className="text-2xl font-bold tabular-nums">{formatCurrency(car.pricePerDay, { whole: true })}</span>
              <span className="text-sm text-muted-foreground">/ day</span>
            </p>
            {days ? (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(estimateTotal(car.pricePerDay, days), { whole: true })} est. total · {days}{" "}
                {days === 1 ? "day" : "days"}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Add dates for a total</p>
            )}
          </div>
          <Button size="sm" variant="soft" tabIndex={-1} className="pointer-events-none transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            View deal
          </Button>
        </div>
      </div>
    </article>
  )
}

/** Same footprint as <CarCard /> so the grid doesn't jump when data arrives */
export function CarCardSkeleton({ view = "grid" }: { view?: CarCardView }) {
  const list = view === "list"
  return (
    <div className={cn("flex overflow-hidden rounded-2xl border bg-card", list ? "flex-col sm:flex-row" : "flex-col")} aria-hidden>
      <Skeleton className={cn("aspect-[16/10] rounded-none", list ? "sm:aspect-auto sm:min-h-44 sm:w-72 sm:shrink-0" : "")} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-3.5 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="mt-auto flex items-end justify-between border-t pt-3">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  )
}
