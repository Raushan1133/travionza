import { FileText, Receipt, Scale, ShieldCheck, type LucideIcon } from "lucide-react"

import type { LegalSlug } from "@/types/legal"

export interface LegalDocMeta {
  slug: LegalSlug
  /** Tab label */
  label: string
  description: string
  icon: LucideIcon
  /** Word file served from /public/legal */
  file: string
}

/** Order here is the order of the tabs */
export const LEGAL_DOCS: LegalDocMeta[] = [
  {
    slug: "overview",
    label: "Overview",
    description: "The key terms at a glance, with all three policies in one place.",
    icon: Scale,
    file: "travionza-legal-policies-complete.docx",
  },
  {
    slug: "terms",
    label: "Terms & Conditions",
    description: "How bookings, payments and responsibilities work between you, Travionza and the rental company.",
    icon: FileText,
    file: "travionza-terms-and-conditions.docx",
  },
  {
    slug: "refund",
    label: "Refund Policy",
    description: "What you pay, what can be refunded, and how long refunds take.",
    icon: Receipt,
    file: "travionza-refund-policy.docx",
  },
  {
    slug: "privacy",
    label: "Privacy Policy",
    description: "What information we collect, how we use and share it, and your rights.",
    icon: ShieldCheck,
    file: "travionza-privacy-policy.docx",
  },
]

export const isLegalSlug = (s: string | undefined): s is LegalSlug => LEGAL_DOCS.some((d) => d.slug === s)

export const legalMeta = (slug: LegalSlug) => LEGAL_DOCS.find((d) => d.slug === slug)!

export const legalFileUrl = (file: string) => `/legal/${file}`

export const legalPath = (slug: LegalSlug) => (slug === "overview" ? "/legal" : `/legal/${slug}`)
