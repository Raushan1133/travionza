import { HeartHandshake, ReceiptText, ShieldCheck, Zap } from "lucide-react"
import { Link } from "react-router-dom"

import { Container, SectionHeading } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useHomeStats } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { APP_NAME } from "@/lib/constants"
import { formatNumber } from "@/lib/format"

const VALUES = [
  { icon: ReceiptText, title: "Honest pricing", text: "The price you compare is the price you pay. Taxes and fees are itemised before you commit." },
  { icon: ShieldCheck, title: "Protected by default", text: "Every rental includes basic cover, with clear options to reduce your excess." },
  { icon: Zap, title: "Fast and simple", text: "Search, compare and book in minutes, on any device." },
  { icon: HeartHandshake, title: "People on call", text: "Real support, any hour, if plans change on the road." },
]

export default function AboutPage() {
  useDocumentTitle("About")
  const { data } = useHomeStats()

  const stats = [
    { label: "Cars available", value: data && `${formatNumber(data.cars)}+` },
    { label: "Locations", value: data && formatNumber(data.locations) },
    { label: "Average rating", value: data && data.averageRating.toFixed(1) },
    { label: "Happy drivers", value: data?.customers },
  ]

  return (
    <div>
      <section className="bg-hero border-b">
        <Container className="max-w-3xl py-16 text-center sm:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">About {APP_NAME}</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Car rental, without the fine print</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            We built {APP_NAME} because renting a car shouldn't feel like decoding a contract. Compare, book and go.
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse rounded-2xl border bg-card p-6 text-center">
              <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
              <dd className="text-3xl font-extrabold tabular-nums tracking-tight">
                {s.value ?? <Skeleton className="mx-auto h-8 w-20" />}
              </dd>
            </div>
          ))}
        </dl>
      </Container>

      <section className="bg-muted/40 py-16">
        <Container>
          <SectionHeading eyebrow="What we stand for" title="Principles that shape every booking" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border bg-card p-6">
                <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="size-5" />
                </span>
                <h3 className="font-semibold tracking-tight">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready when you are</h2>
        <p className="mt-2 text-muted-foreground">Find your car in under a minute.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/cars">Browse cars</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </Container>
    </div>
  )
}
