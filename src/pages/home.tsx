import { CategoryGrid } from "@/components/home/category-grid"
import { DealsStrip } from "@/components/home/deals-strip"
import { Destinations } from "@/components/home/destinations"
import { FeaturedCars } from "@/components/home/featured-cars"
import { Hero } from "@/components/home/hero"
import { HowItWorks } from "@/components/home/how-it-works"
import { Newsletter } from "@/components/home/newsletter"
import { Testimonials } from "@/components/home/testimonials"
import { useDocumentTitle } from "@/hooks/use-document-title"

/** Each section owns its data fetching + skeleton, so the page paints instantly and fills in as data arrives. */
export default function HomePage() {
  useDocumentTitle()
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedCars />
      <Destinations />
      <HowItWorks />
      <DealsStrip />
      <Testimonials />
      <Newsletter />
    </>
  )
}
