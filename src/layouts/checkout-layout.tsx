import { Lock, Phone } from "lucide-react"
import { Outlet } from "react-router-dom"

import { Logo } from "@/components/layout/logo"
import { NavigationProgress } from "@/components/layout/navigation-progress"
import { ScrollToTop } from "@/components/layout/scroll-to-top"
import { ThemeMenu } from "@/components/theme/theme-menu"
import { SUPPORT_PHONE } from "@/lib/constants"

/** Distraction-free shell for checkout: no site navigation, just trust signals */
export function CheckoutLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <NavigationProgress />
      <ScrollToTop />
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="hidden items-center gap-1.5 sm:flex">
              <Lock className="size-4 text-success" /> Secure checkout
            </span>
            <a href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, "")}`} className="hidden items-center gap-1.5 hover:text-foreground md:flex">
              <Phone className="size-4" /> {SUPPORT_PHONE}
            </a>
            <ThemeMenu />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-background py-4 text-center text-xs text-muted-foreground">
        {/* Demo checkout – no real payment is taken. Use card 4242 4242 4242 4242. */}
      </footer>
    </div>
  )
}
