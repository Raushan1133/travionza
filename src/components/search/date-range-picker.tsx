import * as React from "react"
import { CalendarDays } from "lucide-react"
import { isSameDay, startOfToday } from "date-fns"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FieldTrigger } from "@/components/search/field-shell"
import { useMediaQuery } from "@/hooks/use-media-query"
import { formatDate, fromISODate, pluralize, rentalDays, toISODate } from "@/lib/format"

interface DateRangePickerProps {
  from?: string
  to?: string
  onChange: (from?: string, to?: string) => void
  invalid?: boolean
  className?: string
}

/** Two-month range calendar in a popover (one month on phones) */
export function DateRangePicker({ from, to, onChange, invalid, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const wide = useMediaQuery("(min-width: 768px)")

  const fromDate = fromISODate(from)
  const toDate = fromISODate(to)
  const selected: DateRange | undefined = fromDate ? { from: fromDate, to: toDate } : undefined
  const days = rentalDays(from, to)

  const value =
    from && to ? (
      <>
        {formatDate(from, "EEE, MMM d")} → {formatDate(to, "EEE, MMM d")}
        <span className="ml-1.5 text-muted-foreground">· {pluralize(days ?? 1, "day")}</span>
      </>
    ) : from ? (
      `${formatDate(from, "EEE, MMM d")} → choose return`
    ) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FieldTrigger
          icon={CalendarDays}
          label="Pick-up → return"
          placeholder="Add dates"
          value={value}
          invalid={invalid}
          className={className}
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <Calendar
          mode="range"
          numberOfMonths={wide ? 2 : 1}
          selected={selected}
          defaultMonth={fromDate}
          disabled={{ before: startOfToday() }}
          onSelect={(range) => {
            if (!range?.from) {
              onChange(undefined, undefined)
              return
            }
            onChange(toISODate(range.from), range.to ? toISODate(range.to) : undefined)
            // Close once a real range (not just the first click) is chosen
            if (range.to && !isSameDay(range.from, range.to)) setOpen(false)
          }}
        />
        <p className="px-2 pb-1 pt-2 text-xs text-muted-foreground">
          Rentals are charged per 24-hour day. Pick the same day twice for a single-day rental.
        </p>
      </PopoverContent>
    </Popover>
  )
}
