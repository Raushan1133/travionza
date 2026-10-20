import * as React from "react"
import { ChevronDown, ListTree } from "lucide-react"

import { jumpToSection } from "@/components/legal/legal-content"
import { cn } from "@/lib/utils"
import type { LegalBlock } from "@/types/legal"

export interface TocItem {
  id: string
  text: string
}

export const tocFromBlocks = (blocks: LegalBlock[]): TocItem[] =>
  blocks.flatMap((b) => (b.type === "h2" ? [{ id: b.id, text: b.text }] : []))

/** Which section heading is currently at the top of the viewport */
function useActiveSection(ids: string[]) {
  const key = ids.join("|")
  const [active, setActive] = React.useState(ids[0])

  React.useEffect(() => {
    const els = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!els.length) return

    const update = () => {
      let current = els[0].id
      for (const el of els) {
        if (el.getBoundingClientRect().top - 120 <= 0) current = el.id
        else break
      }
      setActive(current)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [key])

  return active
}

function Links({ items, active, onPick }: { items: TocItem[]; active?: string; onPick?: () => void }) {
  return (
    <ol className="space-y-0.5">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? "location" : undefined}
            onClick={(e) => {
              e.preventDefault()
              jumpToSection(item.id)
              onPick?.()
            }}
            className={cn(
              "block rounded-lg px-3 py-1.5 text-sm leading-snug transition-colors",
              active === item.id
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  )
}

/** Sticky "On this page" list on large screens, collapsible on small ones */
export function LegalToc({ items }: { items: TocItem[] }) {
  const active = useActiveSection(items.map((i) => i.id))
  const [open, setOpen] = React.useState(false)
  if (items.length < 2) return null

  return (
    <>
      {/* Mobile / tablet */}
      <div className="rounded-xl border bg-card lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            <ListTree className="size-4 text-primary" /> On this page
          </span>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="max-h-72 overflow-y-auto border-t p-2">
            <Links items={items} active={active} onPick={() => setOpen(false)} />
          </div>
        )}
      </div>

      {/* Desktop */}
      <nav aria-label="On this page" className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 lg:block">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
        <Links items={items} active={active} />
      </nav>
    </>
  )
}
