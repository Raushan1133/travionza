import { Link } from "react-router-dom"

import { Container, SectionHeading } from "@/components/common/page-header"
import { CATEGORIES } from "@/lib/car-meta"
import { carSearchToSearchParams } from "@/lib/search-params"

/** "Browse by type" tiles – each links to /cars with that category pre-selected */
export function CategoryGrid() {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow="Browse by type" title="Whatever the trip, there's a car for it" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {CATEGORIES.map(({ id, label, icon: Icon, blurb }) => (
            <Link
              key={id}
              to={`/cars?${carSearchToSearchParams({ categories: [id] }).toString()}`}
              className="group rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 sm:p-5"
            >
              <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="font-semibold tracking-tight">{label}</h3>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{blurb}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
