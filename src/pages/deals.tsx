import { TicketPercent } from "lucide-react"

import { Container, PageHeader } from "@/components/common/page-header"
import { ErrorState } from "@/components/common/states"
import { DealCard, DealCardSkeleton } from "@/components/deals/deal-card"
import { useDeals } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"

export default function DealsPage() {
  useDocumentTitle("Deals & promo codes")
  const { data, isPending, isError, refetch } = useDeals()

  return (
    <Container className="py-10">
      <PageHeader
        title="Deals & promo codes"
        description="Copy a code, then paste it at checkout. Discounts apply to the base rental rate."
        crumbs={[{ label: "Home", to: "/" }, { label: "Deals" }]}
      />

      <div className="mt-8">
        {isError ? (
          <ErrorState title="We couldn't load deals" onRetry={() => refetch()} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-busy={isPending}>
            {isPending
              ? Array.from({ length: 6 }).map((_, i) => <DealCardSkeleton key={i} />)
              : data.map((d) => <DealCard key={d.id} deal={d} />)}
          </div>
        )}
      </div>

      <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
        <TicketPercent className="size-4" /> One promo code per booking. Codes can't be combined.
      </p>
    </Container>
  )
}
