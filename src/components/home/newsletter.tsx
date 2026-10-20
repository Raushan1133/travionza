import * as React from "react"
import { CircleCheck, Mail } from "lucide-react"

import { Container } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSubscribe } from "@/hooks/queries"
import { STORAGE_KEYS } from "@/lib/constants"
import { readJSON, writeJSON } from "@/lib/storage"

export function Newsletter() {
  const subscribe = useSubscribe()
  const [email, setEmail] = React.useState("")
  const [done, setDone] = React.useState(() => readJSON<boolean>(STORAGE_KEYS.newsletter, false))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    subscribe.mutate(email, {
      onSuccess: () => {
        writeJSON(STORAGE_KEYS.newsletter, true)
        setDone(true)
      },
    })
  }

  return (
    <section className="py-16">
      <Container>
        <div className="bg-hero relative overflow-hidden rounded-3xl border bg-card px-6 py-12 text-center sm:px-12">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="size-6" />
          </span>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Get deals before everyone else</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">One email a month with member-only promo codes. No spam, unsubscribe anytime.</p>

          {done ? (
            <p className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success" role="status">
              <CircleCheck className="size-4" /> You're on the list. Watch your inbox!
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                aria-invalid={subscribe.isError || undefined}
                className="h-11 bg-background"
              />
              <Button type="submit" size="lg" loading={subscribe.isPending}>
                Subscribe
              </Button>
            </form>
          )}
          {subscribe.isError && !done && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {subscribe.error.message}
            </p>
          )}
        </div>
      </Container>
    </section>
  )
}
