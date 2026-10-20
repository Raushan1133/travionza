import type { CarCategory } from "@/types"
import { CATEGORIES } from "@/lib/car-meta"
import { cn } from "@/lib/utils"

/** Horizontally scrollable one-tap category filter */
export function CategoryChips({
  selected,
  onToggle,
}: {
  selected: CarCategory[]
  onToggle: (c: CarCategory) => void
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
      <div className="flex gap-2 pb-1">
        {CATEGORIES.map(({ id, label, icon: Icon }) => {
          const active = selected.includes(id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              aria-pressed={active}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:border-primary/40 hover:bg-accent",
              )}
            >
              <Icon className="size-4" /> {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
