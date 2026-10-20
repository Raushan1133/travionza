import { CalendarClock, ChevronDown, Tag } from "lucide-react"
import { Link } from "react-router-dom"

import type { Deal } from "@/types"
import { CopyCode } from "@/components/common/copy-code"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CATEGORY_LABELS } from "@/lib/car-meta"
import { formatDate } from "@/lib/format"
import { carSearchToSearchParams } from "@/lib/search-params"
import { cn } from "@/lib/utils"

function eligibility(deal: Deal) {
  const parts: string[] = []
  if (deal.categories.length) parts.push(deal.categories.map((c) => CATEGORY_LABELS[c]).join(", "))
  if (deal.fuels?.length) parts.push(deal.fuels.join(", "))
  return parts.length ? parts.join(" · ") : "All cars"
}

export function DealCard({ deal, compact = false, className }: { deal: Deal; compact?: boolean; className?: string }) {
  const browse = carSearchToSearchParams({ categories: deal.categories, fuels: deal.fuels }).toString()

  return (
    <article className={cn("flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg hover:shadow-primary/5", className)}>
      <div
        className="relative flex items-center justify-between gap-4 p-5 text-white"
        style={{ background: `linear-gradient(120deg, oklch(0.55 0.18 ${deal.hue}), oklch(0.4 0.15 ${(deal.hue + 35) % 360}))` }}
      >
        <div className="bg-dots absolute inset-0 opacity-25 mix-blend-overlay" aria-hidden />
        <div className="relative">
          <Badge className="mb-2 bg-white/20 text-white hover:bg-white/20">{deal.badge}</Badge>
          <p className="text-4xl font-extrabold tracking-tight">{deal.discountPercent}% off</p>
        </div>
        <Tag className="relative size-14 -rotate-12 opacity-25" aria-hidden />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold leading-snug tracking-tight">{deal.title}</h3>
          <p className="text-sm text-muted-foreground">{deal.description}</p>
        </div>

        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <CalendarClock className="size-4" /> Valid until {formatDate(deal.validUntil, "MMM d, yyyy")}
          </li>
          <li>Min. {deal.minDays} {deal.minDays === 1 ? "day" : "days"}</li>
          <li>{eligibility(deal)}</li>
        </ul>

        {!compact && (
          <details className="group rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            <summary className="flex list-none items-center justify-between font-medium">
              Terms & conditions
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              {deal.terms.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </details>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
          <CopyCode code={deal.code} />
          <Button asChild variant="soft">
            <Link to={browse ? `/cars?${browse}` : "/cars"}>Find eligible cars</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

export function DealCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card" aria-hidden>
      <Skeleton className="h-[104px] rounded-none" />
      <div className="space-y-4 p-5">
        <Skeleton className="h-5 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
        </div>
        <Skeleton className="h-3.5 w-2/3" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
    </div>
  )
}
