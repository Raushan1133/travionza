import { BadgeCheck, CarFront, MapPin, Star, Users } from "lucide-react"

import { Container } from "@/components/common/page-header"
import { SearchForm } from "@/components/search/search-form"
import { Skeleton } from "@/components/ui/skeleton"
import { useHomeStats } from "@/hooks/queries"
import { formatNumber } from "@/lib/format"

function Stat({ icon: Icon, value, label }: { icon: typeof Star; value?: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        {value ? <p className="text-lg font-bold leading-none tabular-nums">{value}</p> : <Skeleton className="h-5 w-14" />}
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function Hero() {
  const { data } = useHomeStats()

  return (
    <section className="bg-hero relative overflow-hidden border-b">
      <Container className="py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
            <BadgeCheck className="size-4 text-primary" /> Free cancellation on most bookings
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Your next road trip starts <span className="text-primary">here</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Compare rental cars at airports and city locations across the US. Clear pricing, no counter surprises.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl">
          <SearchForm variant="hero" />
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat icon={CarFront} value={data && `${formatNumber(data.cars)}+`} label="Cars available" />
          <Stat icon={MapPin} value={data && formatNumber(data.locations)} label="Locations" />
          <Stat icon={Star} value={data && data.averageRating.toFixed(1)} label="Average rating" />
          <Stat icon={Users} value={data?.customers} label="Happy drivers" />
        </div>
      </Container>
    </section>
  )
}
