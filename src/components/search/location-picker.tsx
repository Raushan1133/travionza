import * as React from "react"
import { MapPin, Plane, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FieldTrigger } from "@/components/search/field-shell"
import { useLocationOptions } from "@/hooks/queries"
import { cn } from "@/lib/utils"

interface LocationPickerProps {
  value?: string
  onChange: (slug: string) => void
  label: string
  placeholder?: string
  invalid?: boolean
  className?: string
}

/** Searchable list of pick-up / drop-off cities (data comes from the mock API) */
export function LocationPicker({
  value,
  onChange,
  label,
  placeholder = "City or airport",
  invalid,
  className,
}: LocationPickerProps) {
  const { data, isLoading } = useLocationOptions()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const selected = data?.find((l) => l.slug === value)
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = data ?? []
    if (!q) return list
    return list.filter((l) => `${l.city} ${l.state} ${l.airportCode} ${l.airportName}`.toLowerCase().includes(q))
  }, [data, query])

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setQuery("")
      }}
    >
      <PopoverTrigger asChild>
        <FieldTrigger
          icon={MapPin}
          label={label}
          placeholder={placeholder}
          value={selected ? `${selected.city}, ${selected.state} (${selected.airportCode})` : undefined}
          invalid={invalid}
          loading={isLoading && Boolean(value)}
          className={className}
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2rem))] p-2">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or airport code"
            className="pl-9"
            aria-label="Search locations"
          />
        </div>

        <ul className="max-h-72 space-y-0.5 overflow-y-auto" role="listbox" aria-label={label}>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg p-2.5">
                <span className="size-8 animate-pulse rounded-lg bg-muted" />
                <span className="flex-1 space-y-1.5">
                  <span className="block h-3.5 w-28 animate-pulse rounded bg-muted" />
                  <span className="block h-3 w-44 animate-pulse rounded bg-muted" />
                </span>
              </li>
            ))}

          {!isLoading && filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">No locations match “{query}”.</li>
          )}

          {filtered.map((l) => (
            <li key={l.slug} role="option" aria-selected={l.slug === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(l.slug)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-accent",
                  l.slug === value && "bg-accent",
                )}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Plane className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {l.city}, {l.state}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {l.airportName} ({l.airportCode})
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
