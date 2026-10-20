import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

/**
 * Brand logo. Two PNGs per shape live in /public/brand and the right one is
 * swapped with the `dark` class, so it follows the theme toggle instantly
 * (no JS, no flash).
 *
 *   full – icon + wordmark + tagline   (logo-light.png / logo-dark.png)
 *   icon – just the "Z" mark           (icon-light.png / icon-dark.png)
 *   auto – icon below `sm`, full from `sm` up (used in the navbar)
 */
type LogoVariant = "full" | "icon" | "auto"

interface LogoProps {
  className?: string
  to?: string
  variant?: LogoVariant
}

const BRAND = "Travionza"

/** Bump this whenever the files in /public/brand change – it busts the browser cache. */
const ASSET_VERSION = "2"

function Pair({ shape, className }: { shape: "logo" | "icon"; className: string }) {
  const [w, h] = shape === "logo" ? [708, 176] : [128, 128]
  const common = { width: w, height: h, alt: "", decoding: "async" as const, draggable: false }
  return (
    <>
      <img src={`/brand/${shape}-light.png?v=${ASSET_VERSION}`} className={cn(className, "dark:hidden")} {...common} />
      <img src={`/brand/${shape}-dark.png?v=${ASSET_VERSION}`} className={cn(className, "hidden dark:block")} {...common} />
    </>
  )
}

export function Logo({ className, to = "/", variant = "full" }: LogoProps) {
  return (
    <Link to={to} className={cn("inline-flex shrink-0 items-center", className)} aria-label={`${BRAND} home`}>
      {variant === "full" && <Pair shape="logo" className="h-9 w-auto sm:h-11" />}
      {variant === "icon" && <Pair shape="icon" className="size-10" />}
      {variant === "auto" && (
        <>
          <span className="inline-flex sm:hidden">
            <Pair shape="icon" className="size-10" />
          </span>
          <span className="hidden sm:inline-flex">
            <Pair shape="logo" className="h-9 w-auto sm:h-11" />
          </span>
        </>
      )}
    </Link>
  )
}
