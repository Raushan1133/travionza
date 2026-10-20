import * as React from "react"
import { ArrowRight, Download, Mail } from "lucide-react"
import { Link, Navigate, useLocation, useParams } from "react-router-dom"

import { Container, PageHeader } from "@/components/common/page-header"
import { ErrorState } from "@/components/common/states"
import { LegalContent } from "@/components/legal/legal-content"
import { LegalSkeleton } from "@/components/legal/legal-skeleton"
import { LegalTabs } from "@/components/legal/legal-tabs"
import { LegalToc, tocFromBlocks } from "@/components/legal/legal-toc"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useLegalDocument } from "@/hooks/use-legal"
import { LEGAL_DOCS, isLegalSlug, legalFileUrl, legalMeta, legalPath } from "@/lib/legal"
import { SUPPORT_EMAIL } from "@/lib/constants"
import type { LegalDocument, LegalSlug } from "@/types/legal"

/** /legal → overview, /legal/terms, /legal/refund, /legal/privacy */
export default function LegalPage() {
  const { doc } = useParams<{ doc?: string }>()
  if (doc === "overview") return <Navigate to="/legal" replace />
  if (doc !== undefined && !isLegalSlug(doc)) return <Navigate to="/legal" replace />
  return <LegalView slug={isLegalSlug(doc) ? doc : "overview"} />
}

function LegalView({ slug }: { slug: LegalSlug }) {
  const meta = legalMeta(slug)
  const isOverview = slug === "overview"
  const title = isOverview ? "Legal & policies" : meta.label
  useDocumentTitle(title)

  const { data, isPending, isError, refetch } = useLegalDocument(slug)
  const { hash } = useLocation()

  // Deep links such as /legal/refund#chargebacks-and-payment-disputes
  React.useEffect(() => {
    if (!data || !hash) return
    const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" }), 50)
    return () => window.clearTimeout(t)
  }, [data, hash])

  return (
    <Container className="max-w-6xl py-10">
      <PageHeader
        title={title}
        description={meta.description}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Legal", to: isOverview ? undefined : "/legal" },
          ...(isOverview ? [] : [{ label: meta.label }]),
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {data && <Badge variant="secondary">Effective {data.effective}</Badge>}
            <Button variant="outline" size="sm" asChild>
              <a href={legalFileUrl(meta.file)} download>
                <Download /> {isOverview ? "Download all (.docx)" : "Download .docx"}
              </a>
            </Button>
          </div>
        }
      />

      <LegalTabs className="mt-8" />

      <div className="mt-8">
        {isError ? (
          <ErrorState title="We couldn't load this document" onRetry={() => refetch()} />
        ) : isPending || !data ? (
          <LegalSkeleton withToc={!isOverview} />
        ) : isOverview ? (
          <Overview doc={data} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
            <aside>
              <LegalToc items={tocFromBlocks(data.blocks)} />
            </aside>
            <article className="min-w-0 max-w-3xl">
              <LegalContent blocks={data.blocks} />
              <ContactNote />
            </article>
          </div>
        )}
      </div>
    </Container>
  )
}

/** Key terms table plus a card for each full policy */
function Overview({ doc }: { doc: LegalDocument }) {
  return (
    <div className="space-y-12">
      <section className="max-w-4xl">
        <h2 className="text-xl font-semibold tracking-tight">{doc.title}</h2>
        <LegalContent blocks={doc.blocks} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Read the full policies</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {LEGAL_DOCS.filter((d) => d.slug !== "overview").map(({ slug, label, description, icon: Icon, file }) => (
            <div key={slug} className="flex flex-col rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md">
              <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="font-semibold">{label}</h3>
              <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{description}</p>
              <div className="mt-5 flex items-center justify-between gap-2">
                <Button size="sm" asChild>
                  <Link to={legalPath(slug)}>
                    Read <ArrowRight />
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <a href={legalFileUrl(file)} download aria-label={`Download ${label} as .docx`}>
                    <Download /> .docx
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ContactNote />
    </div>
  )
}

function ContactNote() {
  return (
    <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-muted/40 p-5">
      <div>
        <p className="font-semibold">Questions about these policies?</p>
        <p className="text-sm text-muted-foreground">Our team is happy to explain anything before you authorize a payment.</p>
      </div>
      <Button variant="outline" asChild>
        <a href={`mailto:${SUPPORT_EMAIL}`}>
          <Mail /> Email us
        </a>
      </Button>
    </div>
  )
}
