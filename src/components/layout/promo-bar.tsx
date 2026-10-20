import * as React from "react"
import { Sparkles, X } from "lucide-react"
import { Link } from "react-router-dom"

import { STORAGE_KEYS } from "@/lib/constants"
import { readJSON, writeJSON } from "@/lib/storage"

/** Dismissible announcement strip above the navbar */
export function PromoBar() {
  const [dismissed, setDismissed] = React.useState(() => readJSON<boolean>(STORAGE_KEYS.promoDismissed, false))
  if (dismissed) return null

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-10 py-2 text-center text-[13px] font-medium">
        <Sparkles className="hidden size-4 shrink-0 sm:block" />
        <span>
          Use code <strong className="rounded bg-white/20 px-1.5 py-0.5 font-bold tracking-wide">DRIVE15</strong> for 15% off
          rentals of 3+ days.{" "}
          <Link to="/deals" className="underline underline-offset-2 hover:no-underline">
            See all deals
          </Link>
        </span>
      </div>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => {
          setDismissed(true)
          writeJSON(STORAGE_KEYS.promoDismissed, true)
        }}
        className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md hover:bg-white/15"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
