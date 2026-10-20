/**
 * Mock "legal documents" endpoint.
 *
 * Same contract as the rest of the mock backend: it resolves after a realistic
 * delay with a cloned payload. Each document lives in its own JSON file that is
 * only downloaded when asked for (dynamic import), the way a real API would
 * serve it. To go live, replace the body of `get` with a fetch to your CMS or
 * backend and keep the signature.
 */
import { ApiError, respond } from "@/mocks/network"
import type { LegalDocument, LegalSlug } from "@/types/legal"

const loaders: Record<LegalSlug, () => Promise<{ default: unknown }>> = {
  overview: () => import("@/mocks/data/legal/overview.json"),
  terms: () => import("@/mocks/data/legal/terms.json"),
  refund: () => import("@/mocks/data/legal/refund.json"),
  privacy: () => import("@/mocks/data/legal/privacy.json"),
}

export const legalApi = {
  get: async (slug: LegalSlug): Promise<LegalDocument> => {
    const load = loaders[slug]
    if (!load) throw new ApiError("We couldn't find that document.", 404)
    const mod = await load()
    // Policies should never randomly "fail" in the demo, so skip the failure roll
    return respond(() => mod.default as LegalDocument, { min: 250, max: 650, reliable: true })
  },
}
