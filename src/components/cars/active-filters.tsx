import { X } from "lucide-react"

import type { CarSearchParams } from "@/types"
import { Button } from "@/components/ui/button"
import { CATEGORY_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/car-meta"
import { formatCurrency } from "@/lib/format"
import { countActiveFilters } from "@/lib/search-params"

interface Chip {
  key: string
  label: string
  remove: () => void
}

/** Removable chips summarising every active filter */
export function ActiveFilters({
  params,
  onChange,
  onClear,
}: {
  params: CarSearchParams
  onChange: (patch: Partial<CarSearchParams>) => void
  onClear: () => void
}) {
  const chips: Chip[] = [
    ...params.categories.map((c) => ({
      key: `cat-${c}`,
      label: CATEGORY_LABELS[c] ?? c,
      remove: () => onChange({ categories: params.categories.filter((x) => x !== c) }),
    })),
    ...params.transmissions.map((t) => ({
      key: `trans-${t}`,
      label: TRANSMISSION_LABELS[t] ?? t,
      remove: () => onChange({ transmissions: params.transmissions.filter((x) => x !== t) }),
    })),
    ...params.fuels.map((f) => ({
      key: `fuel-${f}`,
      label: FUEL_LABELS[f] ?? f,
      remove: () => onChange({ fuels: params.fuels.filter((x) => x !== f) }),
    })),
    ...params.brands.map((b) => ({
      key: `brand-${b}`,
      label: b,
      remove: () => onChange({ brands: params.brands.filter((x) => x !== b) }),
    })),
    ...params.features.map((f) => ({
      key: `feat-${f}`,
      label: f,
      remove: () => onChange({ features: params.features.filter((x) => x !== f) }),
    })),
  ]

  if (params.seats) chips.push({ key: "seats", label: `${params.seats}+ seats`, remove: () => onChange({ seats: undefined }) })
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const a = params.minPrice !== undefined ? formatCurrency(params.minPrice, { whole: true }) : "Any"
    const b = params.maxPrice !== undefined ? formatCurrency(params.maxPrice, { whole: true }) : "Any"
    chips.push({
      key: "price",
      label: `${a} – ${b} / day`,
      remove: () => onChange({ minPrice: undefined, maxPrice: undefined }),
    })
  }
  if (params.q) chips.push({ key: "q", label: `“${params.q}”`, remove: () => onChange({ q: undefined }) })

  if (countActiveFilters(params) === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.remove}
          className="group inline-flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-3 pr-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          aria-label={`Remove filter ${c.label}`}
        >
          {c.label}
          <X className="size-3.5 opacity-70 group-hover:opacity-100" />
        </button>
      ))}
      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClear}>
        Clear all
      </Button>
    </div>
  )
}
