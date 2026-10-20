import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { DealCard, DealCardSkeleton } from "@/components/deals/deal-card"
import { Container, SectionHeading } from "@/components/common/page-header"
import { ErrorState } from "@/components/common/states"
import { Button } from "@/components/ui/button"
import { useDeals } from "@/hooks/queries"

export function DealsStrip() {
  const { data, isPending, isError, refetch } = useDeals()

  return (
    <section className="bg-muted/40 py-16">
      <Container>
        <SectionHeading
          eyebrow="Deals & promo codes"
          title="Save more on your next rental"
          action={
            <Button asChild variant="outline">
              <Link to="/deals">
                All deals <ArrowRight />
              </Link>
            </Button>
          }
        />
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="grid gap-5 md:grid-cols-3" aria-busy={isPending}>
            {isPending
              ? Array.from({ length: 3 }).map((_, i) => <DealCardSkeleton key={i} />)
              : data.slice(0, 3).map((d) => <DealCard key={d.id} deal={d} compact />)}
          </div>
        )}
      </Container>
    </section>
  )
}
