import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Shared look for the big "label + value" cells in the search form */
export const FieldTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    icon: LucideIcon
    label: string
    value?: React.ReactNode
    placeholder: string
    invalid?: boolean
    loading?: boolean
  }
>(({ icon: Icon, label, value, placeholder, invalid, loading, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-invalid={invalid || undefined}
    className={cn(
      "flex h-14 w-full items-center gap-3 rounded-xl border bg-background px-3.5 text-left shadow-xs transition-colors",
      "hover:border-primary/40 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
      invalid && "border-destructive ring-[3px] ring-destructive/15",
      className,
    )}
    {...props}
  >
    <Icon className="size-5 shrink-0 text-primary" />
    <span className="min-w-0 flex-1">
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {loading ? (
        <span className="mt-1 block h-4 w-28 animate-pulse rounded bg-muted" />
      ) : (
        <span className={cn("block truncate text-sm font-medium", !value && "text-muted-foreground")}>
          {value ?? placeholder}
        </span>
      )}
    </span>
  </button>
))
FieldTrigger.displayName = "FieldTrigger"
