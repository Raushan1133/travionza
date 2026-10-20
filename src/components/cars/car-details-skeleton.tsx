import { Container } from "@/components/common/page-header"
import { Skeleton } from "@/components/ui/skeleton"

export function CarDetailsSkeleton() {
  return (
    <Container className="py-6" aria-busy="true" aria-label="Loading car details">
      <Skeleton className="h-4 w-56" />
      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Skeleton className="aspect-[16/9] w-full rounded-3xl sm:aspect-[2/1]" />
          <div className="space-y-3">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-10 w-80" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <Skeleton className="hidden h-[34rem] rounded-2xl lg:block" />
      </div>
    </Container>
  )
}
