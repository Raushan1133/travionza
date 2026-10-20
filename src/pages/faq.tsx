import * as React from "react"
import { Search, SearchX } from "lucide-react"
import { Link } from "react-router-dom"

import { Container, PageHeader } from "@/components/common/page-header"
import { EmptyState, ErrorState } from "@/components/common/states"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useFaqs } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { cn } from "@/lib/utils"

export default function FaqPage() {
  useDocumentTitle("Help centre & FAQs")
  const { data, isPending, isError, refetch } = useFaqs()
  const [q, setQ] = React.useState("")
  const [category, setCategory] = React.useState("All")

  const categories = React.useMemo(() => ["All", ...Array.from(new Set(data?.map((f) => f.category) ?? []))], [data])

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase()
    return (data ?? []).filter(
      (f) =>
        (category === "All" || f.category === category) &&
        (!term || f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term)),
    )
  }, [data, q, category])

  return (
    <Container className="max-w-3xl py-10">
      <PageHeader
        title="Help centre"
        description="Quick answers about booking, pick-up, payments and cancellations."
        crumbs={[{ label: "Home", to: "/" }, { label: "FAQs" }]}
      />

      <div className="relative mt-8">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search questions…"
          aria-label="Search FAQs"
          className="h-12 pl-10 text-base"
        />
      </div>

      <div className="-mx-4 mt-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-1">
          {isPending
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-full" />)
            : categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    category === c ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40 hover:bg-accent",
                  )}
                >
                  {c}
                </button>
              ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-card px-5">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isPending ? (
          <div className="divide-y" aria-busy="true" aria-label="Loading questions">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="py-5">
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No answers found"
            message="Try different keywords, or ask our team directly."
            action={
              <Button asChild>
                <Link to="/contact">Contact us</Link>
              </Button>
            }
          />
        ) : (
          <Accordion type="single" collapsible>
            {filtered.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger>{f.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Still stuck?{" "}
        <Link to="/contact" className="font-medium text-primary hover:underline">
          Talk to a human
        </Link>
      </p>
    </Container>
  )
}
