import { isRouteErrorResponse, useRouteError } from "react-router-dom"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/common/states"
import { Logo } from "@/components/layout/logo"

/** Last-resort error screen for render errors and failed lazy chunks */
export function RouteError() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-4 py-3 sm:px-6">
        <Logo />
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <ErrorState
          title={notFound ? "Page not found" : "Something went wrong"}
          message={
            notFound
              ? "The page you're looking for doesn't exist or has moved."
              : "An unexpected error occurred. Reloading usually fixes it."
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => window.location.reload()}>Reload page</Button>
              <Button variant="outline" asChild>
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          }
        />
      </div>
    </div>
  )
}
