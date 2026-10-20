import { Skeleton } from "@/components/ui/skeleton"

/** Loading placeholder shaped like a policy: a heading, a few paragraphs, a list */
export function LegalSkeleton({ withToc = true }: { withToc?: boolean }) {
  return (
    <div className={withToc ? "grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]" : undefined} aria-busy="true" aria-label="Loading document">
      {withToc && (
        <div className="hidden space-y-2 lg:block">
          <Skeleton className="mb-3 h-3 w-24" />
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full rounded-lg" />
          ))}
        </div>
      )}
      <div className="space-y-10">
        {Array.from({ length: 3 }).map((_, s) => (
          <div key={s} className="space-y-3">
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
            {s === 1 && (
              <div className="space-y-2.5 pt-1 pl-5">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
