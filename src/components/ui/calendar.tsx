import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * Calendar styled for *range* selection (react-day-picker v9).
 * The range start / middle / end cells get the brand colours; `selected`
 * itself is intentionally unstyled so it doesn't fight the range classes.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1", className)}
      classNames={{
        months: "relative flex flex-col gap-6 sm:flex-row",
        month: "w-full space-y-2",
        month_caption: "relative z-20 mx-10 flex h-9 items-center justify-center",
        caption_label: "text-sm font-semibold",
        nav: "absolute top-0 z-30 flex w-full items-center justify-between",
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-9 text-muted-foreground hover:text-foreground"),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-9 text-muted-foreground hover:text-foreground"),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "size-10 p-0 text-center text-xs font-medium text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "group relative size-10 p-0 text-center text-sm",
        day_button: cn(
          "relative flex size-10 items-center justify-center rounded-lg p-0 font-normal outline-none transition-colors",
          "hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
        ),
        selected: "",
        range_start:
          "rounded-l-lg bg-linear-to-r from-transparent from-50% to-accent to-50% [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
        range_end:
          "rounded-r-lg bg-linear-to-l from-transparent from-50% to-accent to-50% [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
        range_middle: "bg-accent text-accent-foreground [&>button]:rounded-none [&>button]:hover:bg-accent",
        today: "[&>button]:font-bold [&>button]:text-primary",
        outside: "text-muted-foreground/50",
        disabled: "opacity-35 [&>button]:pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", chevronClass)} />
          ) : (
            <ChevronRight className={cn("size-4", chevronClass)} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
