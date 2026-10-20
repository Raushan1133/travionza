import * as React from "react"

import { cn } from "@/lib/utils"

/** Shimmering placeholder – size it with className (e.g. `h-4 w-32`). */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-linear-to-r before:from-transparent before:via-foreground/6 before:to-transparent",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
