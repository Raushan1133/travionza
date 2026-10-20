import { BadgeCheck, Check, DoorOpen, Luggage, Settings2, ShieldCheck, UserCheck, Users } from "lucide-react"
import { Link, useParams, useSearchParams } from "react-router-dom"

import { BookingCard } from "@/components/cars/booking-card"
import { CarCard, CarCardSkeleton } from "@/components/cars/car-card"
import { CarDetailsSkeleton } from "@/components/cars/car-details-skeleton"
import { ReviewsSection } from "@/components/cars/reviews-section"
import { CarImage } from "@/components/common/car-image"
import { FavoriteButton } from "@/components/common/favorite-button"
import { Breadcrumbs, Container } from "@/components/common/page-header"
import { Rating } from "@/components/common/rating"
import { EmptyState, ErrorState } from "@/components/common/states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCar, useSimilarCars } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { FUEL_ICONS, FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/car-meta"
import { formatCurrency, formatNumber, rentalDays } from "@/lib/format"
import { parseRental, rentalQuery } from "@/lib/search-params"

export default function CarDetailsPage() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const rental = parseRental(sp)
  const days = rentalDays(rental.from, rental.to)

  const { data: car, isPending, isError, error, refetch } = useCar(id)
  const similar = useSimilarCars(id)

  useDocumentTitle(car?.name)

  if (isPending) return <CarDetailsSkeleton />

  if (isError || !car) {
    const notFound = (error as { status?: number } | null)?.status === 404
    return (
      <Container className="py-16">
        {notFound ? (
          <EmptyState
            title="We couldn't find that car"
            message="It may have been removed, or the link is out of date."
            action={
              <Button asChild>
                <Link to="/cars">Browse all cars</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState onRetry={() => refetch()} />
        )}
      </Container>
    )
  }

  const FuelIcon = FUEL_ICONS[car.fuel]
  const quickSpecs = [
    { icon: Users, label: "Seats", value: car.seats },
    { icon: Luggage, label: "Bags", value: car.bags },
    { icon: DoorOpen, label: "Doors", value: car.doors },
    { icon: Settings2, label: "Gearbox", value: TRANSMISSION_LABELS[car.transmission] },
    { icon: FuelIcon, label: "Fuel", value: FUEL_LABELS[car.fuel] },
    { icon: UserCheck, label: "Min. age", value: `${car.minAge}+` },
  ]

  const specRows: [string, string][] = [
    ["Engine", car.specs.engine],
    ["Fuel economy", car.specs.fuelEconomy],
    ["Drivetrain", car.specs.drivetrain],
    ["Luggage", car.specs.luggage],
    ["Mileage", car.specs.mileage],
    ["Fuel policy", car.specs.fuelPolicy],
    ["Model year", String(car.year)],
    ["Class", car.categoryLabel],
  ]

  return (
    <>
      <Container className="py-6">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Cars", to: `/cars${rentalQuery(rental)}` },
            { label: car.name },
          ]}
        />

        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_24rem]">
          <div className="min-w-0 space-y-8">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl border">
              <div className="absolute left-4 top-4 flex gap-2">
                {car.badge && <Badge>{car.badge}</Badge>}
                <Badge variant="secondary">{car.categoryLabel}</Badge>
              </div>
              <FavoriteButton carId={car.id} carName={car.name} variant="outline" className="absolute right-4 top-4 bg-background/90" />
              <CarImage carId={car.id} body={car.body} color={car.color} name={car.name} images={car.images} priority className="aspect-[16/9] sm:aspect-[2/1]" />
            </div>

            {/* Title */}
            <header className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{car.name}</h1>
              <p className="text-muted-foreground">{car.similarTo}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                <Rating value={car.rating} count={car.reviewCount} />
                {car.freeCancellation && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                    <BadgeCheck className="size-4" /> Free cancellation
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {formatNumber(car.reviewCount)} verified rentals
                </span>
              </div>
            </header>

            {/* Quick specs */}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {quickSpecs.map(({ icon: Icon, label, value }) => (
                <li key={label} className="rounded-xl border bg-card p-3.5">
                  <Icon className="mb-2 size-5 text-primary" />
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold">{value}</p>
                </li>
              ))}
            </ul>

            {/* Details */}
            <Tabs defaultValue="overview" className="gap-6">
              <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto sm:w-fit">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="specs">Specs & features</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({formatNumber(car.reviewCount)})</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <p className="leading-relaxed text-muted-foreground">{car.description}</p>
                <div>
                  <h3 className="mb-3 font-semibold">Included with every rental</h3>
                  <ul className="grid gap-2 text-sm sm:grid-cols-2">
                    {[
                      car.specs.mileage,
                      "Basic third-party liability",
                      "24/7 roadside assistance",
                      car.freeCancellation ? "Free cancellation" : "Fixed-price rate",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <Check className="size-4 text-success" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="space-y-8">
                <dl className="grid overflow-hidden rounded-2xl border sm:grid-cols-2">
                  {specRows.map(([k, v], i) => (
                    <div
                      key={k}
                      className={`flex items-center justify-between gap-4 p-3.5 text-sm ${i % 2 === 0 ? "sm:border-r" : ""} ${i < specRows.length - (specRows.length % 2 === 0 ? 2 : 1) ? "border-b" : ""}`}
                    >
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <h3 className="mb-3 font-semibold">Features</h3>
                  <ul className="flex flex-wrap gap-2">
                    {car.features.map((f) => (
                      <li key={f}>
                        <Badge variant="soft" className="px-3 py-1 text-[13px]">
                          {f}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewsSection carId={car.id} />
              </TabsContent>

              <TabsContent value="policies" className="space-y-4 text-sm">
                {[
                  {
                    title: "Cancellation",
                    body: car.freeCancellation
                      ? "Cancel for free up to 48 hours before pick-up. After that, the first day's rate is charged."
                      : "This is a non-refundable rate. Changes may be possible – contact support.",
                  },
                  { title: "Security deposit", body: `A refundable hold of ${formatCurrency(car.deposit, { whole: true })} is placed on your card at pick-up and released after return.` },
                  { title: "Driver requirements", body: `Drivers must be ${car.minAge}+ with a valid licence held for at least 12 months. Young-driver surcharges may apply under 25.` },
                  { title: "Fuel policy", body: car.specs.fuelPolicy },
                ].map((p) => (
                  <div key={p.title} className="flex gap-3 rounded-xl border bg-card p-4">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold">{p.title}</p>
                      <p className="mt-0.5 text-muted-foreground">{p.body}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookingCard car={car} />
          </aside>
        </div>

        {/* Similar */}
        <section className="mt-16" aria-labelledby="similar-heading">
          <h2 id="similar-heading" className="mb-6 text-2xl font-bold tracking-tight">
            You might also like
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.isPending
              ? Array.from({ length: 4 }).map((_, i) => <CarCardSkeleton key={i} />)
              : similar.data?.map((c) => <CarCard key={c.id} car={c} rental={rental} days={days} />)}
          </div>
        </section>
      </Container>

      {/* Mobile sticky price bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <p>
          <span className="text-xl font-bold tabular-nums">{formatCurrency(car.pricePerDay, { whole: true })}</span>
          <span className="text-sm text-muted-foreground"> / day</span>
        </p>
        <Button asChild>
          <a href="#booking-card">Reserve</a>
        </Button>
      </div>
    </>
  )
}
