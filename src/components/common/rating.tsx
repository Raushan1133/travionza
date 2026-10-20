import { Star } from "lucide-react"

import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Single star + score (+ optional review count) */
export function Rating({
  value,
  count,
  className,
}: {
  value: number
  count?: number
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)} aria-label={`Rated ${value} out of 5`}>
      <Star className="size-4 fill-warning text-warning" />
      <span className="font-semibold">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted-foreground">({formatNumber(count)})</span>}
    </span>
  )
}

/** Five-star row for reviews */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn("size-4", n <= Math.round(value) ? "fill-warning text-warning" : "text-muted-foreground/40")} />
      ))}
    </span>
  )
}
