import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

/** Horizontal progress indicator for multi-step flows (checkout) */
export function Stepper({
  steps,
  current,
  onSelect,
}: {
  steps: string[]
  /** zero-based */
  current: number
  /** Only completed steps are clickable */
  onSelect?: (index: number) => void
}) {
  return (
    <ol className="flex items-center gap-2" aria-label="Checkout progress">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <button
              type="button"
              disabled={!done || !onSelect}
              onClick={() => onSelect?.(i)}
              aria-current={active ? "step" : undefined}
              className="group flex items-center gap-2.5 disabled:cursor-default"
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-background text-primary",
                  !done && !active && "border-border bg-background text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span className={cn("h-0.5 flex-1 rounded-full transition-colors", done ? "bg-primary" : "bg-border")} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
