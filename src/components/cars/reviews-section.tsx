import * as React from "react"
import { MessageSquareOff, ThumbsUp } from "lucide-react"

import { ErrorState, EmptyState } from "@/components/common/states"
import { Stars } from "@/components/common/rating"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCarReviews } from "@/hooks/queries"
import { formatDate, formatNumber } from "@/lib/format"

const INITIAL = 4

export function ReviewsSection({ carId }: { carId: string }) {
  const { data, isPending, isError, refetch } = useCarReviews(carId)
  const [showAll, setShowAll] = React.useState(false)

  if (isPending) return <ReviewsSkeleton />
  if (isError) return <ErrorState title="Couldn't load reviews" onRetry={() => refetch()} />

  const { reviews, summary } = data
  if (reviews.length === 0) {
    return <EmptyState icon={MessageSquareOff} title="No reviews yet" message="Be the first to rent this car and share how it went." />
  }

  const visible = showAll ? reviews : reviews.slice(0, INITIAL)

  return (
    <div className="space-y-8">
      <div className="grid gap-6 rounded-2xl border bg-card p-5 sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-6">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <p className="text-5xl font-bold tabular-nums">{summary.average.toFixed(1)}</p>
          <Stars value={summary.average} />
          <p className="text-sm text-muted-foreground">{formatNumber(summary.total)} reviews</p>
        </div>
        <ul className="space-y-2" aria-label="Rating breakdown">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = summary.distribution[star]
            const pct = summary.total ? Math.round((count / summary.total) * 100) : 0
            return (
              <li key={star} className="flex items-center gap-3 text-sm">
                <span className="w-10 shrink-0 text-muted-foreground">{star} star</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">{pct}%</span>
              </li>
            )
          })}
        </ul>
      </div>

      <ul className="divide-y">
        {visible.map((r) => (
          <li key={r.id} className="space-y-2 py-5 first:pt-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {r.author.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{r.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.tripType} · {formatDate(r.date, "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <Stars value={r.rating} />
            </div>
            <h4 className="font-medium">{r.title}</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ThumbsUp className="size-3.5" /> {r.helpful} found this helpful
            </p>
          </li>
        ))}
      </ul>

      {reviews.length > INITIAL && (
        <Button variant="outline" onClick={() => setShowAll((s) => !s)}>
          {showAll ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
        </Button>
      )}
    </div>
  )
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-36 w-full rounded-2xl" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}
