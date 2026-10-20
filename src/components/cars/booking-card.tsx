import * as React from "react"
import { BadgeCheck, Gauge, TriangleAlert } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import type { Car } from "@/types"
import { QuoteSummary } from "@/components/common/quote-summary"
import { TripFields, hasTripErrors, validateTrip, type TripErrors } from "@/components/search/trip-fields"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, pluralize, rentalDays } from "@/lib/format"
import { calculateQuote } from "@/lib/pricing"
import { parseRental, rentalQuery, rentalToSearchParams } from "@/lib/search-params"

/**
 * Sticky sidebar on the car page. The trip (where & when) lives in the URL,
 * so editing it here also updates links, refreshes and the checkout.
 */
export function BookingCard({ car }: { car: Car }) {
  const navigate = useNavigate()
  const [sp, setSp] = useSearchParams()
  const trip = React.useMemo(() => parseRental(sp), [sp])
  const [errors, setErrors] = React.useState<TripErrors>({})

  const days = rentalDays(trip.from, trip.to)
  const oneWay = Boolean(trip.pickup && trip.dropoff && trip.pickup !== trip.dropoff)
  const unavailable = Boolean(trip.pickup && !car.locations.includes(trip.pickup))
  const quote = days ? calculateQuote({ car, days, oneWay }) : null

  const reserve = () => {
    const next = validateTrip({ ...trip, dropoff: trip.dropoff ?? trip.pickup })
    setErrors(next)
    if (hasTripErrors(next)) {
      toast.error(!trip.pickup ? "Choose a pick-up location first." : "Choose your rental dates first.")
      return
    }
    navigate(`/checkout/${car.id}${rentalQuery(trip)}`)
  }

  return (
    <Card id="booking-card" className="scroll-mt-24 gap-0 overflow-hidden py-0 shadow-lg shadow-primary/5">
      <div className="border-b bg-linear-to-b from-accent/60 to-transparent p-5">
        <p className="flex items-baseline gap-1.5">
          {car.originalPricePerDay && (
            <span className="text-base text-muted-foreground line-through">
              {formatCurrency(car.originalPricePerDay, { whole: true })}
            </span>
          )}
          <span className="text-3xl font-bold tabular-nums">{formatCurrency(car.pricePerDay, { whole: true })}</span>
          <span className="text-muted-foreground">/ day</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-success">
          <BadgeCheck className="size-4" />
          {car.freeCancellation ? "Free cancellation up to 48h before pick-up" : "Non-refundable rate"}
        </p>
      </div>

      <CardContent className="space-y-5 p-5">
        <TripFields
          layout="stack"
          value={trip}
          errors={errors}
          onChange={(next) => {
            setSp(rentalToSearchParams(next), { replace: true })
            if (hasTripErrors(errors)) setErrors(validateTrip(next))
          }}
        />

        {unavailable && (
          <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm" role="alert">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
            <p>
              This car isn't available at your chosen pick-up location.{" "}
              <Link to={`/cars${rentalQuery(trip)}`} className="font-medium underline underline-offset-2">
                See cars available there
              </Link>
              .
            </p>
          </div>
        )}

        {quote ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Your trip</span>
              <span className="text-muted-foreground">{pluralize(quote.days, "day")}</span>
            </div>
            <QuoteSummary quote={quote} />
          </div>
        ) : (
          <p className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
            Add your dates to see the full price with taxes and fees.
          </p>
        )}

        <Button size="xl" className="w-full" disabled={unavailable} onClick={reserve}>
          Continue to booking
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Gauge className="size-3.5" /> {car.specs.mileage} · You won't be charged yet
        </p>
      </CardContent>
    </Card>
  )
}
