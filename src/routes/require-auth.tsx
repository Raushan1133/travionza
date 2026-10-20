import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/context/auth-context"

/** Wrap routes that need a signed-in user; sends guests to /login and back again */
export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <Outlet />
}
