import { LayoutGrid, List, SlidersHorizontal } from "lucide-react"

import type { SortKey } from "@/types"
import type { CarCardView } from "@/components/cars/car-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { SORT_OPTIONS } from "@/lib/car-meta"
import { cn } from "@/lib/utils"

interface ResultsToolbarProps {
  total?: number
  loading?: boolean
  sort: SortKey
  onSort: (s: SortKey) => void
  view: CarCardView
  onView: (v: CarCardView) => void
  activeFilters: number
  onOpenFilters: () => void
}

export function ResultsToolbar({
  total,
  loading,
  sort,
  onSort,
  view,
  onView,
  activeFilters,
  onOpenFilters,
}: ResultsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-h-6 text-sm text-muted-foreground">
        {loading || total === undefined ? (
          <Skeleton className="h-5 w-32" />
        ) : (
          <p>
            <span className="font-semibold text-foreground">{total}</span> {total === 1 ? "car" : "cars"} available
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="lg:hidden" onClick={onOpenFilters}>
          <SlidersHorizontal /> Filters
          {activeFilters > 0 && <Badge className="ml-0.5 h-5 min-w-5 justify-center px-1.5">{activeFilters}</Badge>}
        </Button>

        <Select value={sort} onValueChange={(v) => onSort(v as SortKey)}>
          <SelectTrigger className="w-44" aria-label="Sort cars">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="hidden rounded-lg border p-0.5 sm:flex" role="group" aria-label="Layout">
          {(
            [
              { id: "grid", icon: LayoutGrid, label: "Grid view" },
              { id: "list", icon: List, label: "List view" },
            ] as const
          ).map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={label}
              aria-pressed={view === id}
              onClick={() => onView(id)}
              className={cn(view === id && "bg-accent text-accent-foreground")}
            >
              <Icon />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
