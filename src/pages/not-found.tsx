import { CarFront, Home } from "lucide-react"
import { Link } from "react-router-dom"

import { Container } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { useDocumentTitle } from "@/hooks/use-document-title"

export default function NotFoundPage() {
  useDocumentTitle("Page not found")
  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <p className="text-8xl font-extrabold tracking-tighter text-primary/20">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Looks like you took a wrong turn</h1>
      <p className="mt-2 max-w-md text-muted-foreground">The page you're looking for doesn't exist or has moved. Let's get you back on the road.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/">
            <Home /> Back home
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/cars">
            <CarFront /> Browse cars
          </Link>
        </Button>
      </div>
    </Container>
  )
}
