import * as React from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import type { RentalParams } from "@/types"
import { Button } from "@/components/ui/button"
import { TripFields, hasTripErrors, validateTrip, type TripErrors } from "@/components/search/trip-fields"
import { DEFAULT_PICKUP_TIME, DEFAULT_RETURN_TIME } from "@/lib/constants"
import { rentalQuery } from "@/lib/search-params"
import { cn } from "@/lib/utils"

interface SearchFormProps {
  /** Pre-fill from the URL / a location page */
  initial?: Partial<RentalParams>
  /** Visual treatment: floating card on the hero, or flat bar above results */
  variant?: "hero" | "bar"
  /** Override the default "go to /cars" behaviour (e.g. keep filters on the results page) */
  onSearch?: (rental: RentalParams) => void
  submitLabel?: string
  className?: string
}

const EMPTY: RentalParams = { pickupTime: DEFAULT_PICKUP_TIME, returnTime: DEFAULT_RETURN_TIME }

export function SearchForm({ initial, variant = "hero", onSearch, submitLabel = "Search cars", className }: SearchFormProps) {
  const navigate = useNavigate()
  const [value, setValue] = React.useState<RentalParams>({ ...EMPTY, ...initial })
  const [errors, setErrors] = React.useState<TripErrors>({})

  // Keep in sync when the parent's URL-driven values change
  const initialKey = JSON.stringify(initial ?? {})
  React.useEffect(() => {
    setValue({ ...EMPTY, ...initial })
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = { ...value, dropoff: value.dropoff ?? value.pickup }
    const next = validateTrip(v)
    setErrors(next)
    if (hasTripErrors(next)) {
      toast.error(
        !v.pickup ? "Choose where you'd like to pick up." : "Choose your pick-up and return dates.",
      )
      return
    }
    if (onSearch) onSearch(v)
    else navigate(`/cars${rentalQuery(v)}`)
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className={cn(
        variant === "hero"
          ? "rounded-3xl border bg-card/95 p-4 shadow-xl shadow-primary/5 backdrop-blur sm:p-5"
          : "rounded-2xl border bg-card p-4 shadow-xs",
        className,
      )}
      aria-label="Search rental cars"
    >
      <TripFields
        value={value}
        errors={errors}
        onChange={(v) => {
          setValue(v)
          if (hasTripErrors(errors)) setErrors(validateTrip(v))
        }}
      />
      <Button type="submit" size="xl" className="mt-4 w-full sm:w-auto sm:min-w-52">
        <Search /> {submitLabel}
      </Button>
    </form>
  )
}
