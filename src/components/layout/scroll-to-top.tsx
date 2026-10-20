import * as React from "react"
import { useLocation } from "react-router-dom"

/** Jump back to the top on page changes (but not when only the query string changes) */
export function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
  }, [pathname])
  return null
}
