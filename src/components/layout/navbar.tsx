import * as React from "react"
import { Heart, Menu } from "lucide-react"
import { Link, NavLink, useLocation } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/layout/logo"
import { UserMenu } from "@/components/layout/user-menu"
import { ThemeMenu } from "@/components/theme/theme-menu"
import { useAuth } from "@/context/auth-context"
import { useFavorites } from "@/context/favorites-context"
import { cn } from "@/lib/utils"

/**
 * Light mode: a solid (opaque) tint mixed from the active palette's primary
 * colour, so the header follows the theme (Ocean, Emerald, Sunset, Violet).
 * Raise the percentage for a stronger tint. Dark mode keeps the dark surface.
 */
const HEADER_SURFACE =
  "border-primary/15 bg-[color-mix(in_oklab,var(--primary)_10%,white)] dark:border-border dark:bg-background"

/** Hover/active states that stay visible on the tinted light header */
const LINK_HOVER = "hover:bg-primary/12 hover:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
const LINK_ACTIVE = "bg-primary/15 text-primary dark:bg-accent dark:text-accent-foreground"
const ICON_BUTTON_HOVER =
  "[&_[data-slot=button]]:hover:bg-primary/12 dark:[&_[data-slot=button]]:hover:bg-accent/60"

export const NAV_LINKS = [
  { to: "/cars", label: "Browse cars" },
  { to: "/locations", label: "Locations" },
  { to: "/deals", label: "Deals" },
  { to: "/manage-booking", label: "Manage booking" },
]

export function Navbar() {
  const { count } = useFavorites()
  const { isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const { pathname } = useLocation()

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => setOpen(false), [pathname])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-shadow",
        HEADER_SURFACE,
        ICON_BUTTON_HOVER,
        scrolled && "shadow-sm",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors",
                  LINK_HOVER,
                  isActive && LINK_ACTIVE,
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild className="relative" aria-label="Favorites">
            <Link to="/favorites">
              <Heart />
              {count > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center px-1 text-[10px]">{count}</Badge>
              )}
            </Link>
          </Button>
          <ThemeMenu />
          <UserMenu />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pb-6" aria-label="Mobile">
                {NAV_LINKS.map((l) => (
                  <SheetClose asChild key={l.to}>
                    <NavLink
                      to={l.to}
                      className={({ isActive }) =>
                        cn(
                          "rounded-lg px-3 py-3 text-[15px] font-medium transition-colors hover:bg-accent",
                          isActive && "bg-accent text-accent-foreground",
                        )
                      }
                    >
                      {l.label}
                    </NavLink>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <NavLink to="/favorites" className="rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-accent">
                    Favorites {count > 0 && <span className="text-muted-foreground">({count})</span>}
                  </NavLink>
                </SheetClose>
                {isAuthenticated ? (
                  <>
                    <SheetClose asChild>
                      <NavLink to="/trips" className="rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-accent">
                        My trips
                      </NavLink>
                    </SheetClose>
                    <SheetClose asChild>
                      <NavLink to="/account" className="rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-accent">
                        Account & settings
                      </NavLink>
                    </SheetClose>
                  </>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <SheetClose asChild>
                      <Button variant="outline" asChild>
                        <Link to="/login">Sign in</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild>
                        <Link to="/register">Sign up</Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
