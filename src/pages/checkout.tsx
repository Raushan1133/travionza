import * as React from "react"
import { ArrowLeft, CircleAlert, Lock } from "lucide-react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import type { DriverDetails, RentalParams } from "@/types"
import { DriverForm, validateDriver, type DriverErrors } from "@/components/checkout/driver-form"
import { ExtrasPicker, ProtectionPicker } from "@/components/checkout/extras-step"
import { OrderSummary } from "@/components/checkout/order-summary"
import {
  EMPTY_PAYMENT,
  PaymentForm,
  validatePayment,
  type PaymentErrors,
  type PaymentValue,
} from "@/components/checkout/payment-form"
import { Stepper } from "@/components/common/stepper"
import { EmptyState, ErrorState } from "@/components/common/states"
import { Container } from "@/components/common/page-header"
import { TripFields, hasTripErrors, validateTrip, type TripErrors } from "@/components/search/trip-fields"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-context"
import { useCar, useCreateBooking, useExtras, useProtections } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { STORAGE_KEYS } from "@/lib/constants"
import { formatCurrency, rentalDays } from "@/lib/format"
import { calculateQuote } from "@/lib/pricing"
import { parseRental, rentalQuery, rentalToSearchParams } from "@/lib/search-params"
import { readSession, removeSession, writeSession } from "@/lib/storage"

const STEPS = ["Driver", "Extras & cover", "Payment"]

interface Draft {
  carId: string
  driver: DriverDetails
  extras: Record<string, number>
  protectionId: string
  coupon?: { code: string; percent: number }
}

const EMPTY_DRIVER: DriverDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  licenseCountry: "United States",
  age: "",
  flightNumber: "",
  notes: "",
}

export default function CheckoutPage() {
  useDocumentTitle("Secure checkout")
  const { id } = useParams()
  const navigate = useNavigate()
  const [sp, setSp] = useSearchParams()
  const { user } = useAuth()

  const rental = React.useMemo(() => parseRental(sp), [sp])
  const { data: car, isPending, isError, error, refetch } = useCar(id)
  const { data: extras } = useExtras()
  const { data: protections } = useProtections()
  const create = useCreateBooking()

  const [step, setStep] = React.useState(0)
  const [driverErrors, setDriverErrors] = React.useState<DriverErrors>({})
  const [payment, setPayment] = React.useState<PaymentValue>(EMPTY_PAYMENT)
  const [paymentErrors, setPaymentErrors] = React.useState<PaymentErrors>({})
  const [agreed, setAgreed] = React.useState(false)
  const [agreeError, setAgreeError] = React.useState(false)

  /* ---- Draft (survives refresh, never stores card details) ---- */
  const [draft, setDraft] = React.useState<Draft>(() => {
    const saved = readSession<Draft | null>(STORAGE_KEYS.checkoutDraft, null)
    if (saved && saved.carId === id) return saved
    const [first = "", ...rest] = (user?.name ?? "").split(" ")
    return {
      carId: id ?? "",
      driver: { ...EMPTY_DRIVER, firstName: first, lastName: rest.join(" "), email: user?.email ?? "", phone: user?.phone ?? "" },
      extras: {},
      protectionId: "",
    }
  })

  React.useEffect(() => writeSession(STORAGE_KEYS.checkoutDraft, draft), [draft])

  // Pre-select the recommended protection once the list arrives
  React.useEffect(() => {
    if (protections && !draft.protectionId) {
      const pick = protections.find((p) => p.recommended) ?? protections[0]
      if (pick) setDraft((d) => ({ ...d, protectionId: pick.id }))
    }
  }, [protections, draft.protectionId])

  const patchDriver = (patch: Partial<DriverDetails>) => {
    setDraft((d) => ({ ...d, driver: { ...d.driver, ...patch } }))
    setDriverErrors((e) => {
      const next = { ...e }
      for (const k of Object.keys(patch)) delete next[k as keyof DriverDetails]
      return next
    })
  }

  /* ---- Price ---- */
  const days = rentalDays(rental.from, rental.to) ?? 1
  const oneWay = Boolean(rental.pickup && rental.dropoff && rental.pickup !== rental.dropoff)

  const quote = React.useMemo(() => {
    if (!car || !extras || !protections) return undefined
    return calculateQuote({
      car,
      days,
      oneWay,
      protection: protections.find((p) => p.id === draft.protectionId),
      couponPercent: draft.coupon?.percent ?? 0,
      extras: extras.filter((x) => (draft.extras[x.id] ?? 0) > 0).map((x) => ({ extra: x, qty: draft.extras[x.id] })),
    })
  }, [car, extras, protections, days, oneWay, draft.protectionId, draft.coupon, draft.extras])

  /* ---- Guards ---- */
  if (isPending) return <CheckoutSkeleton />

  if (isError || !car) {
    const notFound = (error as { status?: number } | null)?.status === 404
    return (
      <Container className="py-16">
        {notFound ? (
          <EmptyState
            title="We couldn't find that car"
            action={
              <Button asChild>
                <Link to="/cars">Browse cars</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState onRetry={() => refetch()} />
        )}
      </Container>
    )
  }

  const tripReady = Boolean(rental.pickup && rental.from && rental.to)
  if (!tripReady) {
    return (
      <Container className="max-w-3xl py-12">
        <TripSetup carName={car.name} carId={car.id} rental={rental} onApply={(r) => setSp(rentalToSearchParams(r), { replace: true })} />
      </Container>
    )
  }

  if (rental.pickup && !car.locations.includes(rental.pickup)) {
    return (
      <Container className="py-16">
        <EmptyState
          title="This car isn't available at your pick-up location"
          message="Choose another car or change your location."
          action={
            <Button asChild>
              <Link to={`/cars${rentalQuery(rental)}`}>See available cars</Link>
            </Button>
          }
        />
      </Container>
    )
  }

  /* ---- Navigation between steps ---- */
  const goTo = (n: number) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const next = () => {
    if (step === 0) {
      const errors = validateDriver(draft.driver, car.minAge)
      setDriverErrors(errors)
      if (Object.keys(errors).length) return toast.error("Please check the highlighted fields.")
      goTo(1)
    } else if (step === 1) {
      goTo(2)
    } else {
      pay()
    }
  }

  const pay = () => {
    const errors = validatePayment(payment)
    setPaymentErrors(errors)
    setAgreeError(!agreed)
    if (Object.keys(errors).length || !agreed) return toast.error("Please complete your payment details.")

    create.mutate(
      {
        carId: car.id,
        rental: { ...rental, dropoff: rental.dropoff ?? rental.pickup },
        driver: draft.driver,
        extras: Object.entries(draft.extras)
          .filter(([, qty]) => qty > 0)
          .map(([extraId, qty]) => ({ id: extraId, qty })),
        protectionId: draft.protectionId,
        couponCode: draft.coupon?.code,
        payment,
      },
      {
        onSuccess: (booking) => {
          removeSession(STORAGE_KEYS.checkoutDraft)
          toast.success("Booking confirmed!", { description: `Reference ${booking.ref}` })
          navigate(`/booking/${booking.ref}?new=1`, { replace: true })
        },
        onError: (e) => toast.error(e.message),
      },
    )
  }

  return (
    <Container className="max-w-6xl py-8">
      <Link
        to={`/cars/${car.id}${rentalQuery(rental)}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to {car.name}
      </Link>

      <div className="mb-8 max-w-xl">
        <Stepper steps={STEPS} current={step} onSelect={create.isPending ? undefined : goTo} />
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="min-w-0 space-y-6">
          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Driver details</CardTitle>
                <CardDescription>The main driver must present their licence and card at pick-up.</CardDescription>
              </CardHeader>
              <CardContent>
                <DriverForm value={draft.driver} onChange={patchDriver} errors={driverErrors} minAge={car.minAge} />
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Choose your protection</CardTitle>
                  <CardDescription>Lower your damage excess for a small daily fee.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProtectionPicker
                    protections={protections}
                    value={draft.protectionId}
                    onChange={(protectionId) => setDraft((d) => ({ ...d, protectionId }))}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Add extras</CardTitle>
                  <CardDescription>Everything is optional and can be changed later.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExtrasPicker
                    extras={extras}
                    quantities={draft.extras}
                    onChange={(extraId, qty) => setDraft((d) => ({ ...d, extras: { ...d.extras, [extraId]: qty } }))}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Payment</CardTitle>
                <CardDescription>Your card is charged once the booking is confirmed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PaymentForm
                  value={payment}
                  errors={paymentErrors}
                  onChange={(patch) => {
                    setPayment((p) => ({ ...p, ...patch }))
                    setPaymentErrors((e) => {
                      const nextErrors = { ...e }
                      for (const k of Object.keys(patch)) delete nextErrors[k as keyof PaymentValue]
                      return nextErrors
                    })
                  }}
                />

                <div className="space-y-1.5">
                  <div className="flex items-start gap-2.5">
                    <Checkbox
                      id="terms"
                      checked={agreed}
                      aria-invalid={agreeError ? true : undefined}
                      onCheckedChange={(c) => {
                        setAgreed(c === true)
                        if (c === true) setAgreeError(false)
                      }}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="block cursor-pointer text-sm font-normal leading-snug text-muted-foreground">
                      I agree to the{" "}
                      <Link to="/legal/terms" target="_blank" className="font-medium text-primary underline-offset-4 hover:underline">
                        Terms &amp; Conditions
                      </Link>
                      ,{" "}
                      <Link to="/legal/refund" target="_blank" className="font-medium text-primary underline-offset-4 hover:underline">
                        Refund Policy
                      </Link>{" "}
                      and{" "}
                      <Link to="/legal/privacy" target="_blank" className="font-medium text-primary underline-offset-4 hover:underline">
                        Privacy Policy
                      </Link>
                      , and confirm the driver meets the age and licence requirements.
                    </Label>
                  </div>
                  {agreeError && (
                    <p role="alert" className="text-xs text-destructive">
                      Please accept the terms to continue.
                    </p>
                  )}
                </div>

                {create.isError && (
                  <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <p>{create.error.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="lg" onClick={() => goTo(step - 1)} disabled={step === 0 || create.isPending}>
              <ArrowLeft /> Back
            </Button>
            <Button size="xl" className="min-w-48" onClick={next} loading={create.isPending}>
              {step === 2 ? (
                <>
                  <Lock /> {quote ? `Pay ${formatCurrency(quote.total)}` : "Pay now"}
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-6">
          <OrderSummary
            car={car}
            rental={rental}
            quote={quote}
            coupon={draft.coupon}
            onCoupon={(coupon) => setDraft((d) => ({ ...d, coupon }))}
          />
        </aside>
      </div>
    </Container>
  )
}

/** Shown when someone lands on checkout without dates / location in the URL */
function TripSetup({
  carId,
  carName,
  rental,
  onApply,
}: {
  carId: string
  carName: string
  rental: RentalParams
  onApply: (r: RentalParams) => void
}) {
  const [value, setValue] = React.useState(rental)
  const [errors, setErrors] = React.useState<TripErrors>({})

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">When do you need the {carName}?</CardTitle>
        <CardDescription>Add your pick-up location and dates to continue to checkout.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <TripFields layout="stack" value={value} errors={errors} onChange={setValue} />
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={() => {
              const v = { ...value, dropoff: value.dropoff ?? value.pickup }
              const e = validateTrip(v)
              setErrors(e)
              if (!hasTripErrors(e)) onApply(v)
              else toast.error("Choose a location and your dates.")
            }}
          >
            Continue
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link to={`/cars/${carId}`}>Back to car</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CheckoutSkeleton() {
  return (
    <Container className="max-w-6xl py-8" aria-busy="true" aria-label="Loading checkout">
      <Skeleton className="mb-6 h-4 w-40" />
      <Skeleton className="mb-8 h-8 w-full max-w-xl rounded-full" />
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-4 rounded-2xl border bg-card p-6">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-[30rem] rounded-2xl" />
      </div>
    </Container>
  )
}
