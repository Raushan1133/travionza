import { BadgeCheck, Clock, Tag } from "lucide-react"
import { Outlet } from "react-router-dom"

import { CarIllustration } from "@/components/common/car-image"
import { Logo } from "@/components/layout/logo"
import { ScrollToTop } from "@/components/layout/scroll-to-top"
import { ThemeMenu } from "@/components/theme/theme-menu"

const PERKS = [
  { icon: Tag, text: "Member-only prices and promo codes" },
  { icon: Clock, text: "Faster checkout with saved details" },
  { icon: BadgeCheck, text: "Manage every trip in one place" },
]

/** Split-screen shell for sign in / sign up */
export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <ScrollToTop />
      <aside className="bg-hero relative hidden overflow-hidden border-r bg-muted/40 p-10 lg:flex lg:flex-col">
        <Logo />
        <div className="my-auto max-w-md space-y-8">
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
              Your next road trip starts here.
            </h2>
            <p className="text-muted-foreground">Sign in to book faster and keep all your rentals together.</p>
          </div>
          <ul className="space-y-3">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm font-medium">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <CarIllustration
          body="suv"
          color="#2563eb"
          name="Illustration"
          className="pointer-events-none absolute -bottom-6 -right-10 w-[26rem] opacity-90 animate-[float-slow_6s_ease-in-out_infinite]"
        />
      </aside>

      <section className="relative flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 lg:justify-end">
          <Logo className="lg:hidden" />
          <ThemeMenu />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </section>
    </div>
  )
}
