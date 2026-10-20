import { Heart, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

import { CarCard, CarCardSkeleton } from "@/components/cars/car-card"
import { Container, PageHeader } from "@/components/common/page-header"
import { EmptyState, ErrorState } from "@/components/common/states"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/context/favorites-context"
import { useCarsByIds } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"

export default function FavoritesPage() {
  useDocumentTitle("Saved cars")
  const { ids, clear } = useFavorites()
  const { data, isPending, isError, refetch } = useCarsByIds(ids)

  // Favourites live in localStorage, so an empty list never needs to wait on the "network"
  const empty = ids.length === 0

  return (
    <Container className="py-10">
      <PageHeader
        title="Saved cars"
        description={empty ? "Tap the heart on any car to save it here." : `${ids.length} saved ${ids.length === 1 ? "car" : "cars"}`}
        crumbs={[{ label: "Home", to: "/" }, { label: "Saved cars" }]}
        actions={
          !empty && (
            <Button variant="outline" onClick={clear}>
              <Trash2 /> Clear all
            </Button>
          )
        }
      />

      <div className="mt-8">
        {empty ? (
          <EmptyState
            icon={Heart}
            title="No saved cars yet"
            message="Save the cars you like and compare them later, even after you close the tab."
            action={
              <Button asChild>
                <Link to="/cars">Browse cars</Link>
              </Button>
            }
          />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy={isPending}>
            {isPending
              ? ids.slice(0, 6).map((id) => <CarCardSkeleton key={id} />)
              : data.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
        )}
      </div>
    </Container>
  )
}
