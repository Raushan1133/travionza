import * as React from "react"

import type { CarCategory, CarFacets, CarSearchParams, FuelType, Transmission } from "@/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { CATEGORIES, FUELS, TRANSMISSION_LABELS } from "@/lib/car-meta"
import { formatCurrency } from "@/lib/format"
import { countActiveFilters } from "@/lib/search-params"

interface FilterPanelProps {
  params: CarSearchParams
  /** Undefined while the first page is loading */
  facets?: CarFacets
  onChange: (patch: Partial<CarSearchParams>) => void
  onClear: () => void
}

const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 border-b py-5 first:pt-0 last:border-b-0">
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  )
}

function Option({
  id,
  label,
  count,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  count?: number
  checked: boolean
  onCheckedChange: () => void
}) {
  const disabled = !checked && count === 0
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      <Label htmlFor={id} className="flex-1 cursor-pointer justify-between text-sm font-normal">
        <span className={disabled ? "text-muted-foreground/60" : undefined}>{label}</span>
        {count !== undefined && <span className="text-xs tabular-nums text-muted-foreground">{count}</span>}
      </Label>
    </div>
  )
}

export function FilterPanel({ params, facets, onChange, onClear }: FilterPanelProps) {
  const [showAllBrands, setShowAllBrands] = React.useState(false)
  const activeCount = countActiveFilters(params)

  // Slider keeps its own value while dragging and commits on release
  const lo = params.minPrice ?? facets?.priceMin ?? 0
  const hi = params.maxPrice ?? facets?.priceMax ?? 0
  const [range, setRange] = React.useState<[number, number]>([lo, hi])
  React.useEffect(() => setRange([lo, hi]), [lo, hi])

  if (!facets) return <FilterPanelSkeleton />

  const brands = Object.entries(facets.brands).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const features = Object.entries(facets.features)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Filters</h2>
        {activeCount > 0 && (
          <Button variant="link" size="sm" className="h-auto p-0" onClick={onClear}>
            Clear all
          </Button>
        )}
      </div>

      <Group title="Car type">
        {CATEGORIES.map((c) => (
          <Option
            key={c.id}
            id={`cat-${c.id}`}
            label={c.label}
            count={facets.categories[c.id] ?? 0}
            checked={params.categories.includes(c.id)}
            onCheckedChange={() => onChange({ categories: toggle<CarCategory>(params.categories, c.id) })}
          />
        ))}
      </Group>

      <Group title="Daily price">
        {facets.priceMax > facets.priceMin ? (
          <>
            <Slider
              min={facets.priceMin}
              max={facets.priceMax}
              step={1}
              value={range}
              onValueChange={(v) => setRange([v[0], v[1]])}
              onValueCommit={([a, b]) =>
                onChange({
                  minPrice: a <= facets.priceMin ? undefined : a,
                  maxPrice: b >= facets.priceMax ? undefined : b,
                })
              }
              aria-label="Daily price range"
            />
            <div className="flex justify-between text-sm tabular-nums text-muted-foreground">
              <span>{formatCurrency(range[0], { whole: true })}</span>
              <span>{formatCurrency(range[1], { whole: true })}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">All cars here are {formatCurrency(facets.priceMin, { whole: true })}/day.</p>
        )}
      </Group>

      <Group title="Transmission">
        {(Object.keys(TRANSMISSION_LABELS) as Transmission[]).map((t) => (
          <Option
            key={t}
            id={`trans-${t}`}
            label={TRANSMISSION_LABELS[t]}
            count={facets.transmissions[t] ?? 0}
            checked={params.transmissions.includes(t)}
            onCheckedChange={() => onChange({ transmissions: toggle(params.transmissions, t) })}
          />
        ))}
      </Group>

      <Group title="Fuel">
        {FUELS.map((f) => (
          <Option
            key={f.id}
            id={`fuel-${f.id}`}
            label={f.label}
            count={facets.fuels[f.id] ?? 0}
            checked={params.fuels.includes(f.id)}
            onCheckedChange={() => onChange({ fuels: toggle<FuelType>(params.fuels, f.id) })}
          />
        ))}
      </Group>

      <Group title="Seats">
        <RadioGroup
          value={String(params.seats ?? 0)}
          onValueChange={(v) => onChange({ seats: Number(v) || undefined })}
          className="gap-2.5"
        >
          {[
            { v: 0, label: "Any" },
            { v: 5, label: "5 or more" },
            { v: 7, label: "7 or more" },
          ].map((o) => (
            <div key={o.v} className="flex items-center gap-2.5">
              <RadioGroupItem id={`seats-${o.v}`} value={String(o.v)} />
              <Label htmlFor={`seats-${o.v}`} className="cursor-pointer text-sm font-normal">
                {o.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Group>

      <Group title="Brand">
        {(showAllBrands ? brands : brands.slice(0, 6)).map(([brand, count]) => (
          <Option
            key={brand}
            id={`brand-${brand}`}
            label={brand}
            count={count}
            checked={params.brands.includes(brand)}
            onCheckedChange={() => onChange({ brands: toggle(params.brands, brand) })}
          />
        ))}
        {brands.length > 6 && (
          <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setShowAllBrands((s) => !s)}>
            {showAllBrands ? "Show fewer" : `Show all ${brands.length} brands`}
          </Button>
        )}
      </Group>

      <Group title="Features">
        {features.map(([feature, count]) => (
          <Option
            key={feature}
            id={`feat-${feature}`}
            label={feature}
            count={count}
            checked={params.features.includes(feature)}
            onCheckedChange={() => onChange({ features: toggle(params.features, feature) })}
          />
        ))}
      </Group>
    </div>
  )
}

export function FilterPanelSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-5 w-20" />
      {[5, 2, 2, 2, 4].map((rows, i) => (
        <div key={i} className="space-y-3 border-b pb-5 last:border-b-0">
          <Skeleton className="h-4 w-24" />
          {Array.from({ length: rows }).map((_, j) => (
            <div key={j} className="flex items-center gap-2.5">
              <Skeleton className="size-4.5 rounded-[5px]" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
