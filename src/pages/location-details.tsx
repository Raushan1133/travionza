import * as React from "react"
import { ArrowRight, Building2, Clock, MapPin, MapPinOff, Phone, Plane } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import type { Branch, LocationWithStats } from "@/types"
import { CarCard, CarCardSkeleton } from "@/components/cars/car-card"
import { Breadcrumbs, Container } from "@/components/common/page-header"
import { EmptyState, ErrorState } from "@/components/common/states"
import { SearchForm } from "@/components/search/search-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCarSearch, useLocation } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { formatCurrency } from "@/lib/format"
import { parseCarSearch } from "@/lib/search-params"

function BranchCard({ branch }: { branch: Branch }) {
  const Icon = branch.type === "airport" ? Plane : Building2
  return (
    <li className="flex gap-4 rounded-xl border bg-card p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 space-y-1 text-sm">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {branch.name}
          <Badge variant="secondary" className="capitalize">
            {branch.type}
          </Badge>
        </p>
        <p className="flex items-start gap-1.5 text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" /> {branch.address}
        </p>
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="size-3.5 shrink-0" /> {branch.hours}
        </p>
      </div>
    </li>
  )
}

function LocationHero({ location }: { location: LocationWithStats }) {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ background: `linear-gradient(125deg, oklch(0.55 0.17 ${location.hue}), oklch(0.36 0.13 ${(location.hue + 40) % 360}))` }}
    >
      <div className="bg-dots absolute inset-0 opacity-25 mix-blend-overlay" aria-hidden />
      <Container className="relative py-12 sm:py-16">
        <Breadcrumbs
          items={[{ label: "Home", to: "/" }, { label: "Locations", to: "/locations" }, { label: location.city }]}
          className="mb-6 text-white/70 [&_a:hover]:text-white [&_span.font-medium]:text-white"
        />
        <Badge className="mb-3 bg-white/20 text-white hover:bg-white/20">
          {location.airportCode} · {location.airportName}
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Car rental in {location.city}, {location.state}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-white/85">{location.tagline}</p>
        <p className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/80">
          <span>{location.carCount} cars available</span>
          <span>From {formatCurrency(location.fromPrice, { whole: true })} / day</span>
        </p>
      </Container>
    </section>
  )
}

function LocationSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading location">
      <Skeleton className="h-60 rounded-none" />
      <Container className="space-y-8 py-10">
        <Skeleton className="h-28 w-full rounded-3xl" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CarCardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </div>
  )
}

export default function LocationDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: location, isPending, isError, error, refetch } = useLocation(slug)
  useDocumentTitle(location ? `Car rental in ${location.city}` : "Location")

  // Reuse the real search endpoint: "what can I pick up here?"
  const params = React.useMemo(() => parseCarSearch(new URLSearchParams({ pickup: slug ?? "" })), [slug])
  const cars = useCarSearch(params)
  const available = cars.data?.pages[0]?.items.slice(0, 6)

  if (isPending) return <LocationSkeleton />

  if (isError) {
    const notFound = (error as { status?: number })?.status === 404
    return notFound ? (
      <EmptyState
        icon={MapPinOff}
        title="We couldn't find that location"
        message="It may have moved or never existed. Browse all our locations instead."
        action={
          <Button asChild>
            <Link to="/locations">All locations</Link>
          </Button>
        }
        className="py-24"
      />
    ) : (
      <ErrorState onRetry={() => refetch()} className="py-24" />
    )
  }

  return (
    <div>
      <LocationHero location={location} />

      <Container className="-mt-8 relative z-10">
        <SearchForm variant="hero" initial={{ pickup: location.slug }} />
      </Container>

      <Container className="space-y-14 py-14">
        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">About renting in {location.city}</h2>
            <p className="leading-relaxed text-muted-foreground">{location.description}</p>
            <ul className="flex flex-wrap gap-2 pt-1">
              {location.highlights.map((h) => (
                <li key={h} className="rounded-full border bg-card px-3.5 py-1.5 text-sm">
                  {h}
                </li>
              ))}
            </ul>
            <p className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
              <Phone className="size-4 text-primary" /> Local desk: {location.phone}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Pick-up points</h3>
            <ul className="space-y-3">
              {location.branches.map((b) => (
                <BranchCard key={b.id} branch={b} />
              ))}
            </ul>
          </div>
        </section>

        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Cars available in {location.city}</h2>
            <Button asChild variant="outline">
              <Link to={`/cars?pickup=${location.slug}`}>
                See all {location.carCount} <ArrowRight />
              </Link>
            </Button>
          </div>
          {cars.isError ? (
            <ErrorState onRetry={() => cars.refetch()} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy={cars.isPending}>
              {cars.isPending
                ? Array.from({ length: 3 }).map((_, i) => <CarCardSkeleton key={i} />)
                : available?.map((car) => <CarCard key={car.id} car={car} rental={{ pickup: location.slug }} />)}
            </div>
          )}
        </section>
      </Container>
    </div>
  )
}
