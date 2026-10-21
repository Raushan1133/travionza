import * as React from "react"
import { CircleCheck, Clock, Mail, Phone,Building2 } from "lucide-react"

import { Field } from "@/components/common/form-field"
import { Container, PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/auth-context"
import { useSendContact } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { COMPANY_ADDRESS, COMPANY_NAME, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants"
const TOPICS = ["Change or cancel a booking", "Pick-up & return", "Payments & refunds", "Feedback", "Something else"]

export default function ContactPage() {
  useDocumentTitle("Contact us")
  const { user } = useAuth()
  const send = useSendContact()

  const [form, setForm] = React.useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    topic: TOPICS[0],
    message: "",
  })
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    send.mutate(form)
  }

  return (
    <Container className="py-10">
      <PageHeader
        title="Contact us"
        description="Real people, 24/7. Most messages get a reply within a few hours."
        crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardContent className="p-6 sm:p-8">
            {send.isSuccess ? (
              <div className="flex flex-col items-center py-10 text-center" role="status">
                <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-success/10 text-success">
                  <CircleCheck className="size-7" />
                </span>
                <h2 className="text-xl font-semibold tracking-tight">Message sent</h2>
                <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                  Thanks, {form.name.split(" ")[0] || "friend"}. Your ticket is{" "}
                  <span className="font-mono font-semibold text-foreground">{send.data.ticket}</span>. We'll reply to {form.email}.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    send.reset()
                    setForm((f) => ({ ...f, message: "" }))
                  }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="name" label="Full name">
                    <Input id="name" value={form.name} onChange={(e) => set("name")(e.target.value)} autoComplete="name" />
                  </Field>
                  <Field id="email" label="Email">
                    <Input id="email" type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} autoComplete="email" />
                  </Field>
                </div>

                <Field id="topic" label="Topic">
                  <Select value={form.topic} onValueChange={set("topic")}>
                    <SelectTrigger id="topic" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOPICS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field id="message" label="How can we help?">
                  <Textarea
                    id="message"
                    rows={6}
                    value={form.message}
                    onChange={(e) => set("message")(e.target.value)}
                    placeholder="Include your booking reference if you have one."
                  />
                </Field>

                {send.isError && (
                  <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {send.error.message}
                  </p>
                )}

                <Button type="submit" size="lg" loading={send.isPending} className="w-full sm:w-auto">
                  Send message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          {[
            { icon: Phone, title: "Call us", value: SUPPORT_PHONE, note: "24 hours, 7 days a week" },
            { icon: Mail, title: "Email", value: SUPPORT_EMAIL, note: "Replies within a few hours" },
            { icon: Building2, title: "Our office", value: COMPANY_ADDRESS, note: COMPANY_NAME },
            { icon: Clock, title: "Pick-up desks", value: "Hours vary by branch", note: "Check your location page" },
          ].map((c) => (
            <div key={c.title} className="flex gap-4 rounded-2xl border bg-card p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="size-5" />
              </span>
              <div className="text-sm">
                <p className="text-muted-foreground">{c.title}</p>
                <p className="font-semibold">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.note}</p>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </Container>
  )
}
