import { ShieldCheck } from "lucide-react"

import type { Quote } from "@/types"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Itemised price breakdown shared by details, checkout and booking pages */
export function QuoteSummary({ quote, className }: { quote: Quote; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <ul className="space-y-2.5 text-sm">
        {quote.lines.map((line, i) => (
          <li key={`${line.label}-${i}`} className="flex items-start justify-between gap-4">
            <div>
              <p className={cn(line.amount < 0 && "text-success")}>{line.label}</p>
              {line.detail && <p className="text-xs text-muted-foreground">{line.detail}</p>}
            </div>
            <span className={cn("shrink-0 tabular-nums", line.amount < 0 && "text-success")}>
              {line.amount < 0 ? "−" : ""}
              {formatCurrency(Math.abs(line.amount))}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-baseline justify-between border-t pt-3">
        <span className="font-semibold">Total</span>
        <span className="text-2xl font-bold tabular-nums">{formatCurrency(quote.total)}</span>
      </div>

      <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
        <span>
          A refundable security deposit of {formatCurrency(quote.deposit, { whole: true })} is held on your card at
          pick-up and released after return.
        </span>
      </p>
    </div>
  )
}

/** Skeleton twin of <QuoteSummary /> */
export function QuoteSummarySkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-14 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
