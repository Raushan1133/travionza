import * as React from "react"
import { Calendar, CarFront, Check, CreditCard, Mail, Printer, Search, TriangleAlert, User } from "lucide-react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import type { Booking } from "@/types"
import { StatusBadge } from "@/components/bookings/status-badge"
import { CarImage } from "@/components/common/car-image"
import { Breadcrumbs, Container } from "@/components/common/page-header"
import { QuoteSummary } from "@/components/common/quote-summary"
import { EmptyState, ErrorState } from "@/components/common/states"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useBooking, useCancelBooking, useLocation } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { formatCurrency, formatDateLong, formatTime, maskCard, pluralize } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function BookingDetailsPage() {
  const { ref } = useParams()
  const [sp] = useSearchParams()
  const email = sp.get("email") ?? undefined
  const isNew = sp.get("new") === "1"

  const { data: booking, isPending, isError, error, refetch } = useBooking(ref, email)
  useDocumentTitle(booking ? `Booking ${booking.ref}` : "Booking")

  if (isPending) return <BookingSkeleton />

  if (isError || !booking) {
    const notFound = (error as { status?: number } | null)?.status === 404
    return (
      <Container className="py-16">
        {notFound ? (
          <EmptyState
            icon={Search}
            title="Booking not found"
            message="Check your reference and email, then try again."
            action={
              <Button asChild>
                <Link to="/manage-booking">Find my booking</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState onRetry={() => refetch()} />
        )}
      </Container>
    )
  }

  return <BookingView booking={booking} isNew={isNew} />
}

function BookingView({ booking, isNew }: { booking: Booking; isNew: boolean }) {
  const cancel = useCancelBooking()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const pickupLoc = useLocation(booking.pickup.locationSlug)
  const dropoffLoc = useLocation(booking.dropoff.locationSlug)
  const cancelled = booking.status === "cancelled"

  const stops = [
    { label: "Pick-up", stop: booking.pickup, branch: pickupLoc.data?.branches[0], loading: pickupLoc.isPending },
    { label: "Return", stop: booking.dropoff, branch: dropoffLoc.data?.branches[0], loading: dropoffLoc.isPending },
  ]

  return (
    <Container className="max-w-5xl py-8">
      <Breadcrumbs className="no-print mb-5" items={[{ label: "Home", to: "/" }, { label: "Manage booking", to: "/manage-booking" }, { label: booking.ref }]} />

      {isNew && !cancelled && (
        <div className="mb-8 flex flex-col items-center gap-3 rounded-3xl border border-success/30 bg-success/10 p-8 text-center">
          <span className="grid size-16 animate-[pop_0.5s_ease-out] place-items-center rounded-full bg-success text-white">
            <Check className="size-8" strokeWidth={3} />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">You're all set, {booking.driver.firstName}!</h1>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4" /> A confirmation was sent to {booking.driver.email}
          </p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          {!isNew && <h1 className="text-3xl font-bold tracking-tight">Your booking</h1>}
          <p className="flex flex-wrap items-center gap-3 text-muted-foreground">
            Reference <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-base font-semibold text-foreground">{booking.ref}</span>
            <StatusBadge status={booking.status} />
          </p>
        </div>
        <div className="no-print flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer /> Print
          </Button>
          {booking.status === "confirmed" && (
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setConfirmOpen(true)}>
              Cancel booking
            </Button>
          )}
        </div>
      </div>

      {cancelled && (
        <div role="status" className="mb-6 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <p>This booking has been cancelled. Any refund returns to your card within 5–7 business days.</p>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* Car */}
          <Card className="gap-0 overflow-hidden py-0">
            <div className="flex flex-col items-center gap-4 bg-linear-to-b from-accent/60 to-transparent p-5 sm:flex-row">
              <div className="w-48 shrink-0 overflow-hidden rounded-xl">
                <CarImage carId={booking.car.id} body={booking.car.body} color={booking.car.color} name={booking.car.name} />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl font-semibold">{booking.car.name}</p>
                <p className="text-sm text-muted-foreground">{booking.car.similarTo}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {booking.car.categoryLabel} · {booking.car.seats} seats · {booking.car.bags} bags · {booking.car.transmission}
                </p>
              </div>
            </div>
          </Card>

          {/* Trip */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="size-5 text-primary" /> Trip · {pluralize(booking.days, "day")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {stops.map(({ label, stop, branch, loading }) => (
                <div key={label} className={cn("space-y-1", cancelled && "opacity-60")}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="font-semibold">{formatDateLong(stop.date)}</p>
                  <p className="text-sm">{formatTime(stop.time)}</p>
                  <p className="pt-1 text-sm font-medium">{stop.locationName}</p>
                  {loading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    branch && (
                      <p className="text-sm text-muted-foreground">
                        {branch.address}
                        <br />
                        {branch.hours}
                      </p>
                    )
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Driver + extras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="size-5 text-primary" /> Driver & options
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 text-sm sm:grid-cols-2">
              <dl className="space-y-2">
                {[
                  ["Name", `${booking.driver.firstName} ${booking.driver.lastName}`],
                  ["Email", booking.driver.email],
                  ["Phone", booking.driver.phone],
                  ["Licence", booking.driver.licenseCountry],
                  ["Age", booking.driver.age],
                  ...(booking.driver.flightNumber ? [["Flight", booking.driver.flightNumber]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="truncate text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground">Protection</p>
                  <p className="font-medium">{booking.protection.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Extras</p>
                  {booking.extras.length ? (
                    <ul className="font-medium">
                      {booking.extras.map((x) => (
                        <li key={x.id}>
                          {x.name}
                          {x.qty > 1 ? ` × ${x.qty}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-medium">None</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Price details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuoteSummary quote={booking.quote} />
              <p className="flex items-center gap-2 border-t pt-3 text-sm text-muted-foreground">
                <CreditCard className="size-4" /> Paid with {maskCard(booking.paymentLast4)}
              </p>
            </CardContent>
          </Card>
          <Button variant="soft" size="lg" className="no-print w-full" asChild>
            <Link to="/cars">
              <CarFront /> Book another car
            </Link>
          </Button>
        </aside>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              {booking.ref} · {booking.car.name}. You'll be refunded {formatCurrency(booking.quote.total)} to your
              card ending {booking.paymentLast4}. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={cancel.isPending}>
              Keep booking
            </Button>
            <Button
              variant="destructive"
              loading={cancel.isPending}
              onClick={() =>
                cancel.mutate(booking.ref, {
                  onSuccess: () => {
                    setConfirmOpen(false)
                    toast.success("Booking cancelled")
                  },
                  onError: (e) => toast.error(e.message),
                })
              }
            >
              Yes, cancel it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  )
}

function BookingSkeleton() {
  return (
    <Container className="max-w-5xl py-8" aria-busy="true" aria-label="Loading booking">
      <Skeleton className="mb-5 h-4 w-52" />
      <Skeleton className="mb-6 h-10 w-64" />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </Container>
  )
}
