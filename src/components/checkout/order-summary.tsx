import * as React from "react"
import { ArrowRight, CircleCheck, Tag, X } from "lucide-react"

import type { Car, Quote, RentalParams } from "@/types"
import { CarImage } from "@/components/common/car-image"
import { QuoteSummary, QuoteSummarySkeleton } from "@/components/common/quote-summary"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocationOptions, useValidateCoupon } from "@/hooks/queries"
import { formatDate, formatTime, pluralize } from "@/lib/format"
import { locationLabel } from "@/lib/location"

interface OrderSummaryProps {
  car: Car
  rental: RentalParams
  quote?: Quote
  coupon?: { code: string; percent: number }
  onCoupon: (coupon?: { code: string; percent: number }) => void
}

export function OrderSummary({ car, rental, quote, coupon, onCoupon }: OrderSummaryProps) {
  const { data: locations } = useLocationOptions()
  const validate = useValidateCoupon()
  const [code, setCode] = React.useState("")

  const pickup = locations?.find((l) => l.slug === rental.pickup)
  const dropoff = locations?.find((l) => l.slug === (rental.dropoff ?? rental.pickup))

  const apply = (e: React.FormEvent) => {
    e.preventDefault()
    validate.mutate(
      { code, days: quote?.days, category: car.category, fuel: car.fuel },
      {
        onSuccess: (res) => {
          if (res.valid) {
            onCoupon({ code: res.code, percent: res.percent })
            setCode("")
          }
        },
      },
    )
  }

  const result = validate.data
  const error = validate.isError ? "Couldn't check that code. Try again." : result && !result.valid ? result.message : undefined

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center gap-3 border-b bg-linear-to-b from-accent/60 to-transparent p-4">
        <div className="w-28 shrink-0 overflow-hidden rounded-lg">
          <CarImage carId={car.id} body={car.body} color={car.color} name={car.name} images={car.images} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{car.name}</p>
          <p className="truncate text-xs text-muted-foreground">{car.similarTo}</p>
        </div>
      </div>

      <CardContent className="space-y-5 p-4">
        <ol className="relative space-y-4 pl-6 text-sm before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border">
          {[
            { label: "Pick-up", loc: pickup, date: rental.from, time: rental.pickupTime },
            { label: "Return", loc: dropoff, date: rental.to, time: rental.returnTime },
          ].map((s) => (
            <li key={s.label} className="relative">
              <span className="absolute -left-6 top-1 size-3.5 rounded-full border-[3px] border-primary bg-background" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
              {s.loc ? (
                <p className="font-medium">{locationLabel(s.loc)}</p>
              ) : (
                <Skeleton className="mt-1 h-4 w-32" />
              )}
              <p className="text-muted-foreground">
                {formatDate(s.date, "EEE, MMM d")} · {formatTime(s.time)}
              </p>
            </li>
          ))}
        </ol>

        {coupon ? (
          <div className="flex items-center justify-between rounded-xl border border-success/40 bg-success/10 p-3 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <CircleCheck className="size-4 text-success" /> {coupon.code} · {coupon.percent}% off
            </span>
            <Button variant="ghost" size="icon-sm" aria-label="Remove promo code" onClick={() => onCoupon(undefined)}>
              <X />
            </Button>
          </div>
        ) : (
          <form onSubmit={apply} className="space-y-1.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Promo code"
                  className="pl-9 uppercase"
                  aria-label="Promo code"
                  aria-invalid={error ? true : undefined}
                />
              </div>
              <Button type="submit" variant="outline" loading={validate.isPending} disabled={!code.trim()}>
                Apply
              </Button>
            </div>
            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </form>
        )}

        {quote ? (
          <>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {pluralize(quote.days, "day")} <ArrowRight className="size-3.5" />
              {formatDate(rental.from, "MMM d")} – {formatDate(rental.to, "MMM d")}
            </p>
            <QuoteSummary quote={quote} />
          </>
        ) : (
          <QuoteSummarySkeleton />
        )}
      </CardContent>
    </Card>
  )
}
