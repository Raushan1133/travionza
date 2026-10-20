import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { CarCard, CarCardSkeleton } from "@/components/cars/car-card"
import { Container, SectionHeading } from "@/components/common/page-header"
import { ErrorState } from "@/components/common/states"
import { Button } from "@/components/ui/button"
import { useFeaturedCars } from "@/hooks/queries"

export function FeaturedCars() {
  const { data, isPending, isError, refetch } = useFeaturedCars()

  return (
    <section className="bg-muted/40 py-16">
      <Container>
        <SectionHeading
          eyebrow="Popular right now"
          title="Top-rated cars our drivers love"
          description="Hand-picked from thousands of bookings. Add dates to see your total."
          action={
            <Button asChild variant="outline">
              <Link to="/cars">
                View all cars <ArrowRight />
              </Link>
            </Button>
          }
        />

        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy={isPending}>
            {isPending
              ? Array.from({ length: 6 }).map((_, i) => <CarCardSkeleton key={i} />)
              : data.slice(0, 6).map((car) => <CarCard key={car.id} car={car} />)}
          </div>
        )}
      </Container>
    </section>
  )
}
