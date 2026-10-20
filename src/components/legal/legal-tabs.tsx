import { NavLink } from "react-router-dom"

import { LEGAL_DOCS, legalPath } from "@/lib/legal"
import { cn } from "@/lib/utils"

/**
 * Tab-style navigation between the policies. They are real links (not local
 * state), so every tab has its own shareable URL and the back button works.
 */
export function LegalTabs({ className }: { className?: string }) {
  return (
    <nav aria-label="Legal documents" className={cn("-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 [&::-webkit-scrollbar]:hidden sm:px-0", className)}>
      <ul className="flex w-max gap-1 rounded-2xl border bg-card p-1 sm:w-fit">
        {LEGAL_DOCS.map(({ slug, label, icon: Icon }) => (
          <li key={slug}>
            <NavLink
              to={legalPath(slug)}
              end
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
