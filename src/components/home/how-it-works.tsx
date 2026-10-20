import { CalendarCheck, KeyRound, Search } from "lucide-react"

import { Container, SectionHeading } from "@/components/common/page-header"

const STEPS = [
  { icon: Search, title: "Search & compare", text: "Enter where and when. We show every available car with the real price, taxes included at checkout." },
  { icon: CalendarCheck, title: "Book in minutes", text: "Add extras and protection, pay securely and get an instant confirmation by email." },
  { icon: KeyRound, title: "Pick up & go", text: "Skip the queue with your reference, collect the keys and hit the road." },
]

export function HowItWorks() {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow="How it works" title="Three steps to the driver's seat" />
        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border bg-card p-6">
              <span className="absolute right-5 top-4 text-5xl font-extrabold text-muted-foreground/15" aria-hidden>
                {i + 1}
              </span>
              <span className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-6" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
