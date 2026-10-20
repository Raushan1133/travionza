import { Quote } from "lucide-react"

import { Container, SectionHeading } from "@/components/common/page-header"
import { Stars } from "@/components/common/rating"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useTestimonials } from "@/hooks/queries"
import { initials } from "@/lib/format"

export function Testimonials() {
  const { data, isPending, isError } = useTestimonials()
  if (isError) return null // decorative section – fail quietly

  return (
    <section className="bg-muted/40 py-16">
      <Container>
        <SectionHeading eyebrow="Driver stories" title="Loved by people who actually drive" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-busy={isPending}>
          {isPending
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4 rounded-2xl border bg-card p-6" aria-hidden>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-11/12" />
                  <Skeleton className="h-3.5 w-3/4" />
                  <div className="flex items-center gap-3 pt-2">
                    <Skeleton className="size-9 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))
            : data.slice(0, 3).map((t) => (
                <figure key={t.id} className="flex flex-col rounded-2xl border bg-card p-6">
                  <Quote className="mb-3 size-6 text-primary/30" aria-hidden />
                  <Stars value={t.rating} />
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">“{t.text}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials(t.name)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium leading-tight">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.city} · {t.trip}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              ))}
        </div>
      </Container>
    </section>
  )
}
