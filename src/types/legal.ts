/** Shape of the JSON produced by scripts/docx-to-legal-json.py */

export type LegalSlug = "overview" | "terms" | "refund" | "privacy"

/** A run of text with optional bold / italic */
export interface LegalInline {
  t: string
  b?: boolean
  i?: boolean
}

export type LegalBlock =
  | { type: "h2"; id: string; text: string; schedule?: boolean }
  | { type: "h3"; text: string }
  | { type: "p"; inlines: LegalInline[] }
  | { type: "ul" | "ol"; items: LegalInline[][] }
  | { type: "table"; head: LegalInline[][] | null; rows: LegalInline[][][] }
  /** A fill-in form (e.g. the payment authorization schedules) */
  | { type: "form"; blocks: LegalBlock[] }

export interface LegalDocument {
  slug: LegalSlug
  title: string
  /** e.g. "October 20, 2026" */
  effective: string
  blocks: LegalBlock[]
}
