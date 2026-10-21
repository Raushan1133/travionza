import { Building2, Mail, MapPin, Phone } from "lucide-react"
import { Link } from "react-router-dom"

import { Logo } from "@/components/layout/logo"
import { Separator } from "@/components/ui/separator"
import { COMPANY_ADDRESS, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants"
const COLUMNS = [
  {
    title: "Explore",
    links: [
      { to: "/cars", label: "Browse cars" },
      { to: "/locations", label: "Locations" },
      { to: "/deals", label: "Deals & promo codes" },
      { to: "/favorites", label: "Saved cars" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/manage-booking", label: "Manage booking" },
      { to: "/faq", label: "Help centre & FAQs" },
      { to: "/contact", label: "Contact us" },
      { to: "/about", label: "About Travionza" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/legal/terms", label: "Terms & Conditions" },
      { to: "/legal/refund", label: "Refund Policy" },
      { to: "/legal/privacy", label: "Privacy Policy" },
      { to: "/legal", label: "All policies" },
    ],
  },
  {
    title: "Popular cities",
    links: [
      { to: "/locations/orlando", label: "Orlando" },
      { to: "/locations/miami", label: "Miami" },
      { to: "/locations/los-angeles", label: "Los Angeles" },
      { to: "/locations/las-vegas", label: "Las Vegas" },
      { to: "/locations/new-york", label: "New York" },
    ],
  },
]

/**
 * Light mode: solid tint of the active palette's primary colour (a touch
 * stronger than the header so the page visibly "ends"). Dark mode uses the
 * card surface.
 */
const FOOTER_SURFACE =
  "border-primary/15 bg-[color-mix(in_oklab,var(--primary)_14%,white)] dark:border-border dark:bg-card"

export function Footer() {
  return (
    <footer className={`mt-20 border-t ${FOOTER_SURFACE}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Compare rental cars at airports and city locations across the US. Transparent pricing and free
              cancellation on most bookings.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" /> {SUPPORT_PHONE}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary" /> {SUPPORT_EMAIL}
              </li>
              <li className="flex items-start gap-2">
                <Building2 className="mt-0.5 size-4 shrink-0 text-primary" /> {COMPANY_ADDRESS}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" /> Across USA · 24/7 support
              </li>
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Separator className="my-8 bg-primary/15 dark:bg-border" />
        <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Travionza. All rights reserved.</p>
          <p>Prices shown in USD. Taxes and fees are itemised at checkout.</p>
        </div>
      </div>
    </footer>
  )
}
