import * as React from "react"
import { MapPinOff, Search } from "lucide-react"

import { Container, PageHeader } from "@/components/common/page-header"
import { EmptyState, ErrorState } from "@/components/common/states"
import { LocationCard, LocationCardSkeleton } from "@/components/locations/location-card"
import { Input } from "@/components/ui/input"
import { useLocations } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"

export default function LocationsPage() {
  useDocumentTitle("Rental locations")
  const { data, isPending, isError, refetch } = useLocations()
  const [q, setQ] = React.useState("")

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return data
    return data?.filter((l) =>
      [l.city, l.state, l.airportCode, l.airportName].some((s) => s.toLowerCase().includes(term)),
    )
  }, [data, q])

  return (
    <Container className="py-10">
      <PageHeader
        title="Rental locations"
        description="Airport and downtown pick-up points across the US. Choose a city to see what's available."
        crumbs={[{ label: "Home", to: "/" }, { label: "Locations" }]}
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search city or airport code"
              aria-label="Search locations"
              className="h-10 pl-9"
            />
          </div>
        }
      />

      <div className="mt-8">
        {isError ? (
          <ErrorState title="We couldn't load locations" onRetry={() => refetch()} />
        ) : !isPending && filtered?.length === 0 ? (
          <EmptyState icon={MapPinOff} title={`No locations match "${q}"`} message="Try a city name or a three-letter airport code like MCO." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy={isPending}>
            {isPending
              ? Array.from({ length: 8 }).map((_, i) => <LocationCardSkeleton key={i} />)
              : filtered?.map((l) => <LocationCard key={l.slug} location={l} />)}
          </div>
        )}
      </div>
    </Container>
  )
}
