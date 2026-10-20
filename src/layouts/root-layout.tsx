import { Outlet } from "react-router-dom"

import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { NavigationProgress } from "@/components/layout/navigation-progress"
import { PromoBar } from "@/components/layout/promo-bar"
import { ScrollToTop } from "@/components/layout/scroll-to-top"

/** Default shell: promo strip, sticky navbar, page, footer */
export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavigationProgress />
      <ScrollToTop />
      <PromoBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
