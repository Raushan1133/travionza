import { CalendarX, CarFront, History, Plane } from "lucide-react"
import { Link } from "react-router-dom"

import type { Booking, BookingStatus } from "@/types"
import { BookingListItem, BookingListSkeleton } from "@/components/bookings/booking-list-item"
import { Container, PageHeader } from "@/components/common/page-header"
import { EmptyState, ErrorState } from "@/components/common/states"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { useMyBookings } from "@/hooks/queries"
import { useDocumentTitle } from "@/hooks/use-document-title"

const TABS: { id: BookingStatus; label: string; icon: typeof Plane; empty: string }[] = [
  { id: "confirmed", label: "Upcoming", icon: Plane, empty: "No upcoming trips. Where to next?" },
  { id: "completed", label: "Past", icon: History, empty: "Your completed rentals will show up here." },
  { id: "cancelled", label: "Cancelled", icon: CalendarX, empty: "You haven't cancelled any bookings." },
]

export default function TripsPage() {
  useDocumentTitle("My trips")
  const { user } = useAuth()
  const { data, isPending, isError, refetch } = useMyBookings(user?.email)

  const by = (status: BookingStatus): Booking[] => data?.filter((b) => b.status === status) ?? []

  return (
    <Container className="max-w-4xl py-10">
      <PageHeader
        title="My trips"
        description={`Bookings for ${user?.email}`}
        actions={
          <Button asChild>
            <Link to="/cars">
              <CarFront /> New booking
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="confirmed" className="mt-8 gap-6">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
              <t.icon className="size-4" /> {t.label}
              {data && <span className="text-xs text-muted-foreground">({by(t.id).length})</span>}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            {isPending ? (
              <BookingListSkeleton />
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : by(t.id).length === 0 ? (
              <EmptyState
                icon={t.icon}
                title={t.empty}
                action={
                  t.id === "confirmed" ? (
                    <Button asChild>
                      <Link to="/cars">Find a car</Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-4">
                {by(t.id).map((b) => (
                  <BookingListItem key={b.ref} booking={b} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </Container>
  )
}
