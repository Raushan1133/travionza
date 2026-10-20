import type { BookingStatus } from "@/types"
import { Badge } from "@/components/ui/badge"

const MAP: Record<BookingStatus, { label: string; variant: "success" | "muted" | "destructive" }> = {
  confirmed: { label: "Confirmed", variant: "success" },
  completed: { label: "Completed", variant: "muted" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, variant } = MAP[status]
  return <Badge variant={variant}>{label}</Badge>
}
