import { useQuery } from "@tanstack/react-query"

import { legalApi } from "@/services/legal-api"
import type { LegalSlug } from "@/types/legal"

export const useLegalDocument = (slug: LegalSlug) =>
  useQuery({
    queryKey: ["legal", slug] as const,
    queryFn: () => legalApi.get(slug),
    // Policies change rarely – keep them for the whole session
    staleTime: Infinity,
  })
