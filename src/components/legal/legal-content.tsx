import * as React from "react"
import { Link2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { LegalBlock, LegalInline } from "@/types/legal"

/** Scroll to a section and put its id in the address bar (without a router navigation) */
export function jumpToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "start" })
  window.history.replaceState(null, "", `#${id}`)
}

const LINK_RE = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|https?:\/\/[^\s)]+)/g

/** Plain text, with e-mail addresses and URLs turned into links */
function Text({ children }: { children: string }) {
  // split() with a capture group puts the matches at the odd indexes
  const parts = children.split(LINK_RE)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={part.includes("@") && !part.startsWith("http") ? `mailto:${part}` : part}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  )
}

function Inlines({ items }: { items: LegalInline[] }) {
  return (
    <>
      {items.map((s, i) => {
        let node: React.ReactNode = <Text>{s.t}</Text>
        if (s.i) node = <em>{node}</em>
        if (s.b) node = <strong className="font-semibold text-foreground">{node}</strong>
        return <React.Fragment key={i}>{node}</React.Fragment>
      })}
    </>
  )
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          id={block.id}
          className="group mt-12 flex scroll-mt-28 items-center gap-2 border-t pt-8 text-xl font-semibold tracking-tight text-foreground first:mt-0 first:border-0 first:pt-0"
        >
          {block.text}
          <a
            href={`#${block.id}`}
            onClick={(e) => {
              e.preventDefault()
              jumpToSection(block.id)
            }}
            aria-label={`Link to “${block.text}”`}
            className="text-muted-foreground opacity-0 transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Link2 className="size-4" />
          </a>
        </h2>
      )

    case "h3":
      return <h3 className="mt-6 text-base font-semibold text-foreground">{block.text}</h3>

    case "p":
      return (
        <p className="mt-3">
          <Inlines items={block.inlines} />
        </p>
      )

    case "ul":
    case "ol": {
      const List = block.type
      return (
        <List
          className={cn(
            "mt-3 space-y-2 pl-5 marker:text-primary/70",
            block.type === "ul" ? "list-disc" : "list-decimal marker:font-semibold",
          )}
        >
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              <Inlines items={item} />
            </li>
          ))}
        </List>
      )
    }

    case "table":
      return (
        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[34rem] border-collapse text-sm leading-6">
            {block.head && (
              <thead className="bg-muted/60 text-left">
                <tr>
                  {block.head.map((cell, i) => (
                    <th key={i} className="px-4 py-3 font-semibold text-foreground">
                      <Inlines items={cell} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-t align-top">
                  {row.map((cell, c) => (
                    <td key={c} className={cn("px-4 py-3", c === 0 && "font-medium text-foreground")}>
                      <Inlines items={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case "form":
      return (
        <div className="mt-4 rounded-xl border border-dashed bg-muted/30 p-5 [&>*:first-child]:mt-0">
          {block.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </div>
      )
  }
}

/** Renders a policy's blocks with readable typography that follows the theme */
export function LegalContent({ blocks, className }: { blocks: LegalBlock[]; className?: string }) {
  return (
    <div className={cn("text-[15px] leading-7 text-foreground/85", className)}>
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  )
}
