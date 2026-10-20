import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { LocationCard, LocationCardSkeleton } from "@/components/locations/location-card"
import { Container, SectionHeading } from "@/components/common/page-header"
import { ErrorState } from "@/components/common/states"
import { Button } from "@/components/ui/button"
import { useLocations } from "@/hooks/queries"

export function Destinations() {
  const { data, isPending, isError, refetch } = useLocations()
  const popular = data?.filter((l) => l.popular).slice(0, 4)

  return (
    <section className="py-16">
      <Container>
        <SectionHeading
          eyebrow="Popular destinations"
          title="Pick up where your trip begins"
          action={
            <Button asChild variant="outline">
              <Link to="/locations">
                All locations <ArrowRight />
              </Link>
            </Button>
          }
        />
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy={isPending}>
            {isPending
              ? Array.from({ length: 4 }).map((_, i) => <LocationCardSkeleton key={i} />)
              : popular?.map((l) => <LocationCard key={l.slug} location={l} />)}
          </div>
        )}
      </Container>
    </section>
  )
}
