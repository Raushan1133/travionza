import * as React from "react"
import { CircleAlert, Search } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { Field } from "@/components/common/form-field"
import { Container } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { useLookupBooking } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { DEMO_EMAIL } from "@/services/api"

export default function ManageBookingPage() {
  useDocumentTitle("Manage booking")
  const navigate = useNavigate()
  const { user } = useAuth()
  const lookup = useLookupBooking()

  const [ref, setRef] = React.useState("")
  const [email, setEmail] = React.useState(user?.email ?? "")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    lookup.mutate(
      { ref, email },
      {
        onSuccess: (b) => navigate(`/booking/${b.ref}?email=${encodeURIComponent(email.trim())}`),
      },
    )
  }

  return (
    <Container className="max-w-xl py-14">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Manage your booking</h1>
        <p className="text-muted-foreground">View, print or cancel a reservation with your reference and email.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find your booking</CardTitle>
          <CardDescription>Your reference is in the confirmation email (e.g. DE-7K2M9Q).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <Field id="ref" label="Booking reference">
              <Input
                id="ref"
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                placeholder="DE-XXXXXX"
                autoComplete="off"
                className="font-mono uppercase"
              />
            </Field>
            <Field id="lookup-email" label="Email used to book">
              <Input
                id="lookup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Field>

            {lookup.isError && (
              <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                <p>{lookup.error.message}</p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" loading={lookup.isPending} disabled={!ref.trim() || !email.trim()}>
              <Search /> Find booking
            </Button>
          </form>

          <div className="mt-6 space-y-2 border-t pt-4 text-sm text-muted-foreground">
            
            <p>
              Have an account?{" "}
              <Link to="/trips" className="font-medium text-primary underline-offset-2 hover:underline">
                See all your trips
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </Container>
  )
}
