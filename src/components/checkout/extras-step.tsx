import { Baby, Fuel, LifeBuoy, Minus, Navigation, Plus, ShieldCheck, Ticket, UserPlus, Wifi, Check, type LucideIcon } from "lucide-react"

import type { Extra, Protection } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
  baby: Baby,
  fuel: Fuel,
  "life-buoy": LifeBuoy,
  navigation: Navigation,
  ticket: Ticket,
  "user-plus": UserPlus,
  wifi: Wifi,
}

/* ------------------------------------------------------------------ */
/* Protection                                                          */
/* ------------------------------------------------------------------ */

export function ProtectionPicker({
  protections,
  value,
  onChange,
}: {
  protections?: Protection[]
  value: string
  onChange: (id: string) => void
}) {
  if (!protections) {
    return (
      <div className="grid gap-3 md:grid-cols-3" aria-hidden>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid gap-3 md:grid-cols-3" aria-label="Protection level">
      {protections.map((p) => {
        const selected = p.id === value
        return (
          <label
            key={p.id}
            htmlFor={`prot-${p.id}`}
            className={cn(
              "relative flex cursor-pointer flex-col gap-3 rounded-2xl border bg-card p-4 transition-all hover:border-primary/40",
              selected && "border-primary ring-2 ring-primary/20",
            )}
          >
            {p.recommended && <Badge className="absolute -top-2.5 right-3">Recommended</Badge>}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <span className="font-semibold">{p.name}</span>
              </div>
              <RadioGroupItem id={`prot-${p.id}`} value={p.id} />
            </div>
            <p className="text-xs text-muted-foreground">{p.description}</p>
            <p className="text-lg font-bold tabular-nums">
              {p.pricePerDay === 0 ? "Included" : `${formatCurrency(p.pricePerDay)}`}
              {p.pricePerDay > 0 && <span className="text-xs font-normal text-muted-foreground"> / day</span>}
            </p>
            <ul className="space-y-1.5 text-xs">
              {p.included.map((i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" /> {i}
                </li>
              ))}
            </ul>
            <p className="mt-auto border-t pt-2 text-xs text-muted-foreground">
              Damage excess: <strong className="text-foreground">{formatCurrency(p.excess, { whole: true })}</strong>
            </p>
          </label>
        )
      })}
    </RadioGroup>
  )
}

/* ------------------------------------------------------------------ */
/* Extras                                                              */
/* ------------------------------------------------------------------ */

export function ExtrasPicker({
  extras,
  quantities,
  onChange,
}: {
  extras?: Extra[]
  quantities: Record<string, number>
  onChange: (id: string, qty: number) => void
}) {
  if (!extras) {
    return (
      <div className="space-y-3" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {extras.map((x) => {
        const Icon = ICONS[x.icon] ?? Ticket
        const qty = quantities[x.id] ?? 0
        return (
          <li
            key={x.id}
            className={cn(
              "flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors",
              qty > 0 && "border-primary/50 bg-primary/5",
            )}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-medium">
                {x.name}
                {x.popular && <Badge variant="soft">Popular</Badge>}
              </p>
              <p className="text-xs text-muted-foreground">{x.description}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold tabular-nums">
                {formatCurrency(x.price)}
                <span className="text-xs font-normal text-muted-foreground">{x.unit === "day" ? " / day" : " / rental"}</span>
              </p>
              {x.maxQty === 1 ? (
                <Switch
                  className="mt-1.5"
                  checked={qty > 0}
                  onCheckedChange={(on) => onChange(x.id, on ? 1 : 0)}
                  aria-label={`Add ${x.name}`}
                />
              ) : (
                <div className="mt-1.5 inline-flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Remove one ${x.name}`}
                    disabled={qty === 0}
                    onClick={() => onChange(x.id, qty - 1)}
                  >
                    <Minus />
                  </Button>
                  <span className="w-4 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                    {qty}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Add one ${x.name}`}
                    disabled={qty >= x.maxQty}
                    onClick={() => onChange(x.id, qty + 1)}
                  >
                    <Plus />
                  </Button>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
