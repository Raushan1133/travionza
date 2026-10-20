import { ArrowRight, CarFront, Plane } from "lucide-react"
import { Link } from "react-router-dom"

import type { LocationWithStats } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

/** City tile. The gradient is derived from the location's `hue`, so every city looks distinct in any palette. */
export function LocationCard({ location, className }: { location: LocationWithStats; className?: string }) {
  const { hue } = location
  return (
    <Link
      to={`/locations/${location.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
    >
      <div
        className="relative flex h-32 items-end justify-between overflow-hidden p-4 text-white"
        style={{ background: `linear-gradient(135deg, oklch(0.62 0.17 ${hue}), oklch(0.42 0.14 ${(hue + 40) % 360}))` }}
      >
        <div className="bg-dots absolute inset-0 opacity-30 mix-blend-overlay" aria-hidden />
        <Plane className="absolute -right-3 -top-3 size-24 rotate-12 opacity-15 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden />
        <div className="relative">
          <h3 className="text-xl font-bold leading-tight tracking-tight">{location.city}</h3>
          <p className="text-xs text-white/80">
            {location.state} · {location.airportCode}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">{location.tagline}</p>
        <div className="mt-auto flex items-center justify-between border-t pt-3 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CarFront className="size-4" /> {location.carCount} cars
          </span>
          <span className="font-semibold">
            from {formatCurrency(location.fromPrice, { whole: true })}
            <span className="font-normal text-muted-foreground"> /day</span>
          </span>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-primary">
          Explore {location.city}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

export function LocationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card" aria-hidden>
      <Skeleton className="h-32 rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-4/5" />
        <div className="flex justify-between border-t pt-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  )
}
