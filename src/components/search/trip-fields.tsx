import * as React from "react"

import type { RentalParams } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DateRangePicker } from "@/components/search/date-range-picker"
import { LocationPicker } from "@/components/search/location-picker"
import { TimeSelect } from "@/components/search/time-select"
import { cn } from "@/lib/utils"

export interface TripErrors {
  pickup?: boolean
  dropoff?: boolean
  dates?: boolean
}

interface TripFieldsProps {
  value: RentalParams
  onChange: (next: RentalParams) => void
  errors?: TripErrors
  /** "row" = wide horizontal bar, "stack" = single column (sidebars) */
  layout?: "row" | "stack"
}

/**
 * The "where & when" inputs. Controlled – parents own the state so the same
 * fields work in the hero search, the results bar, the details sidebar and
 * the checkout fallback.
 */
export function TripFields({ value, onChange, errors = {}, layout = "row" }: TripFieldsProps) {
  const [different, setDifferent] = React.useState(Boolean(value.dropoff && value.dropoff !== value.pickup))

  // If the URL changes the drop-off externally, keep the checkbox honest
  React.useEffect(() => {
    if (value.dropoff && value.dropoff !== value.pickup) setDifferent(true)
  }, [value.dropoff, value.pickup])

  const set = (patch: Partial<RentalParams>) => onChange({ ...value, ...patch })
  const row = layout === "row"

  return (
    <div className="space-y-3">
      <div className={cn("grid gap-3", row ? "md:grid-cols-2 lg:grid-cols-12" : "grid-cols-1")}>
        <div className={cn(row && (different ? "lg:col-span-3" : "lg:col-span-4"))}>
          <LocationPicker
            label={different ? "Pick-up location" : "Pick-up & return"}
            value={value.pickup}
            invalid={errors.pickup}
            onChange={(pickup) => set({ pickup, dropoff: different ? value.dropoff : pickup })}
          />
        </div>

        {different && (
          <div className={cn(row && "lg:col-span-3")}>
            <LocationPicker
              label="Return location"
              placeholder="Where are you returning?"
              value={value.dropoff}
              invalid={errors.dropoff}
              onChange={(dropoff) => set({ dropoff })}
            />
          </div>
        )}

        <div className={cn(row && (different ? "lg:col-span-3" : "lg:col-span-4"))}>
          <DateRangePicker
            from={value.from}
            to={value.to}
            invalid={errors.dates}
            onChange={(from, to) => set({ from, to })}
          />
        </div>

        <div className={cn("grid grid-cols-2 gap-3", row && (different ? "lg:col-span-3" : "lg:col-span-4"))}>
          <TimeSelect label="Pick-up time" value={value.pickupTime} onChange={(pickupTime) => set({ pickupTime })} />
          <TimeSelect label="Return time" value={value.returnTime} onChange={(returnTime) => set({ returnTime })} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={`diff-${layout}`}
          checked={different}
          onCheckedChange={(checked) => {
            const on = checked === true
            setDifferent(on)
            if (!on) set({ dropoff: value.pickup })
          }}
        />
        <Label htmlFor={`diff-${layout}`} className="cursor-pointer text-sm font-normal text-muted-foreground">
          Return to a different location <span className="text-xs">(one-way fee applies)</span>
        </Label>
      </div>
    </div>
  )
}

/** Returns which fields are missing – used before navigating or booking */
export function validateTrip(v: RentalParams): TripErrors {
  return {
    pickup: !v.pickup,
    dropoff: !v.dropoff,
    dates: !v.from || !v.to,
  }
}

export const hasTripErrors = (e: TripErrors) => Boolean(e.pickup || e.dropoff || e.dates)
