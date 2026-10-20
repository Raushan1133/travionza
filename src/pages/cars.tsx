import * as React from "react"
import { CarFront, LoaderCircle } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import type { CarCategory, CarSearchParams } from "@/types"
import { ActiveFilters } from "@/components/cars/active-filters"
import { CarCard, CarCardSkeleton, type CarCardView } from "@/components/cars/car-card"
import { CategoryChips } from "@/components/cars/category-chips"
import { FilterPanel } from "@/components/cars/filter-panel"
import { ResultsToolbar } from "@/components/cars/results-toolbar"
import { EmptyState, ErrorState } from "@/components/common/states"
import { Container } from "@/components/common/page-header"
import { SearchForm } from "@/components/search/search-form"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCarSearch, useLocationOptions } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { PAGE_SIZE } from "@/lib/constants"
import { rentalDays } from "@/lib/format"
import { carSearchToSearchParams, countActiveFilters, parseCarSearch } from "@/lib/search-params"
import { readJSON, writeJSON } from "@/lib/storage"
import { cn } from "@/lib/utils"

const VIEW_KEY = "driveease-results-view"

export default function CarsPage() {
  const [sp, setSp] = useSearchParams()
  const params = React.useMemo(() => parseCarSearch(sp), [sp])
  const days = rentalDays(params.from, params.to)

  const query = useCarSearch(params)
  const { data: locations } = useLocationOptions()
  const place = locations?.find((l) => l.slug === params.pickup)

  useDocumentTitle(place ? `Rental cars in ${place.city}` : "Rental cars")

  const [view, setView] = React.useState<CarCardView>(() => readJSON<CarCardView>(VIEW_KEY, "grid"))
  const [filtersOpen, setFiltersOpen] = React.useState(false)

  const changeView = (v: CarCardView) => {
    setView(v)
    writeJSON(VIEW_KEY, v)
  }

  /** The URL is the source of truth – every filter change just rewrites it */
  const update = React.useCallback(
    (patch: Partial<CarSearchParams>) => setSp(carSearchToSearchParams({ ...params, ...patch }), { replace: true }),
    [params, setSp],
  )

  const clearFilters = () =>
    setSp(
      carSearchToSearchParams({
        pickup: params.pickup,
        dropoff: params.dropoff,
        from: params.from,
        to: params.to,
        pickupTime: params.pickupTime,
        returnTime: params.returnTime,
        sort: params.sort,
      }),
      { replace: true },
    )

  const pages = query.data?.pages
  const items = React.useMemo(() => pages?.flatMap((p) => p.items) ?? [], [pages])
  const facets = pages?.[0]?.facets
  const total = pages?.[0]?.total
  const activeFilters = countActiveFilters(params)
  const refining = query.isPlaceholderData // previous results shown while new ones load

  // Infinite scroll: load the next page when the sentinel scrolls into view
  const sentinel = React.useRef<HTMLDivElement>(null)
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query
  React.useEffect(() => {
    const node = sentinel.current
    if (!node || !hasNextPage) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: "400px" },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length])

  const toggleCategory = (c: CarCategory) =>
    update({ categories: params.categories.includes(c) ? params.categories.filter((x) => x !== c) : [...params.categories, c] })

  const gridClass = view === "list" ? "grid grid-cols-1 gap-4" : "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"

  return (
    <div>
      {/* Search bar */}
      <div className="border-b bg-muted/40">
        <Container className="py-5">
          <SearchForm
            variant="bar"
            initial={{
              pickup: params.pickup,
              dropoff: params.dropoff,
              from: params.from,
              to: params.to,
              pickupTime: params.pickupTime,
              returnTime: params.returnTime,
            }}
            submitLabel="Update search"
            onSearch={(rental) => update(rental)}
          />
        </Container>
      </div>

      <Container className="py-8">
        <div className="mb-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {place ? `Rental cars in ${place.city}, ${place.state}` : "All rental cars"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {days ? `Prices shown per day, with an estimated total for ${days} ${days === 1 ? "day" : "days"}.` : "Add your dates to see an estimated total for your trip."}
            </p>
          </div>
          <CategoryChips selected={params.categories} onToggle={toggleCategory} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
          {/* Desktop filters */}
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border bg-card p-5 scrollbar-none">
              <FilterPanel params={params} facets={facets} onChange={update} onClear={clearFilters} />
            </div>
          </aside>

          <section className="min-w-0 space-y-4" aria-live="polite">
            <ResultsToolbar
              total={total}
              loading={query.isPending}
              sort={params.sort}
              onSort={(sort) => update({ sort })}
              view={view}
              onView={changeView}
              activeFilters={activeFilters}
              onOpenFilters={() => setFiltersOpen(true)}
            />

            <ActiveFilters params={params} onChange={update} onClear={clearFilters} />

            {query.isPending ? (
              <div className={gridClass} aria-busy="true" aria-label="Loading cars">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <CarCardSkeleton key={i} view={view} />
                ))}
              </div>
            ) : query.isError ? (
              <ErrorState
                title="We couldn't load cars"
                message="Something went wrong while searching. Please try again."
                onRetry={() => query.refetch()}
              />
            ) : items.length === 0 ? (
              <EmptyState
                icon={CarFront}
                title="No cars match your filters"
                message="Try removing a filter or widening your price range."
                action={activeFilters > 0 ? <Button onClick={clearFilters}>Clear all filters</Button> : undefined}
              />
            ) : (
              <>
                <div className={cn(gridClass, "transition-opacity duration-200", refining && "pointer-events-none opacity-50")}>
                  {items.map((car) => (
                    <CarCard key={car.id} car={car} rental={params} days={days} view={view} />
                  ))}
                  {isFetchingNextPage &&
                    Array.from({ length: 3 }).map((_, i) => <CarCardSkeleton key={`more-${i}`} view={view} />)}
                </div>

                <div ref={sentinel} className="flex justify-center pt-4">
                  {hasNextPage ? (
                    <Button variant="outline" size="lg" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
                      Show more cars
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">You've seen all {total} cars.</p>
                  )}
                </div>
              </>
            )}

            {refining && (
              <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full border bg-card px-4 py-2 text-sm shadow-lg">
                <span className="flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin text-primary" /> Updating results…
                </span>
              </div>
            )}
          </section>
        </div>
      </Container>

      {/* Mobile filters */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col gap-0 p-0">
          <SheetHeader className="border-b">
            <SheetTitle>Filter cars</SheetTitle>
            <SheetDescription>Refine by type, price, features and more.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <FilterPanel params={params} facets={facets} onChange={update} onClear={clearFilters} />
          </div>
          <SheetFooter className="border-t">
            <Button size="lg" onClick={() => setFiltersOpen(false)}>
              {total !== undefined ? `Show ${total} ${total === 1 ? "car" : "cars"}` : "Show cars"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
