import type { ComponentType } from "react"
import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom" 
import { RootLayout } from "@/layouts/root-layout"
import { CheckoutLayout } from "@/layouts/checkout-layout"
import { AuthLayout } from "@/layouts/auth-layout"
import { RequireAuth } from "@/routes/require-auth"
import { RouteError } from "@/routes/route-error"

/**
 * Every page is code-split. React Router waits for the chunk before
 * switching screens, and the top progress bar (see NavigationProgress)
 * covers that gap.
 */
const page =
  (load: () => Promise<{ default: ComponentType }>): RouteObject["lazy"] =>
  async () => ({ Component: (await load()).default })

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, lazy: page(() => import("@/pages/home")) },
      { path: "cars", lazy: page(() => import("@/pages/cars")) },
      { path: "cars/:id", lazy: page(() => import("@/pages/car-details")) },
      { path: "locations", lazy: page(() => import("@/pages/locations")) },
      { path: "locations/:slug", lazy: page(() => import("@/pages/location-details")) },
      { path: "deals", lazy: page(() => import("@/pages/deals")) },
      { path: "favorites", lazy: page(() => import("@/pages/favorites")) },
      { path: "manage-booking", lazy: page(() => import("@/pages/manage-booking")) },
      { path: "booking/:ref", lazy: page(() => import("@/pages/booking-details")) },
      { path: "faq", lazy: page(() => import("@/pages/faq")) },
      { path: "contact", lazy: page(() => import("@/pages/contact")) },
      { path: "about", lazy: page(() => import("@/pages/about")) },
      { path: "legal", lazy: page(() => import("@/pages/legal")) },
      { path: "legal/:doc", lazy: page(() => import("@/pages/legal")) },
      { path: "terms", element: <Navigate to="/legal/terms" replace /> },
      { path: "terms-and-conditions", element: <Navigate to="/legal/terms" replace /> },
      { path: "privacy", element: <Navigate to="/legal/privacy" replace /> },
      { path: "privacy-policy", element: <Navigate to="/legal/privacy" replace /> },
      { path: "refund-policy", element: <Navigate to="/legal/refund" replace /> },
      { path: "refunds", element: <Navigate to="/legal/refund" replace /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "trips", lazy: page(() => import("@/pages/trips")) },
          { path: "account", lazy: page(() => import("@/pages/account")) },
        ],
      },
      { path: "*", lazy: page(() => import("@/pages/not-found")) },
    ],
  },
  {
    element: <CheckoutLayout />,
    errorElement: <RouteError />,
    children: [{ path: "checkout/:id", lazy: page(() => import("@/pages/checkout")) }],
  },
  {
    element: <AuthLayout />,
    errorElement: <RouteError />,
    children: [
      { path: "login", lazy: page(() => import("@/pages/login")) },
      { path: "register", lazy: page(() => import("@/pages/register")) },
    ],
  },
])
