import { Clock } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TIME_SLOTS } from "@/lib/constants"
import { formatTime } from "@/lib/format"

/** Half-hour time slots in the same big-cell style as the other search fields */
export function TimeSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-label={label}
          className="h-14 w-full gap-3 rounded-xl px-3.5 text-left data-[size=default]:h-14 [&>span]:flex-1"
        >
          <Clock className="size-5 shrink-0 text-primary" />
          <span className="flex min-w-0 flex-col items-start">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
            <SelectValue>{formatTime(value)}</SelectValue>
          </span>
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {TIME_SLOTS.map((t) => (
            <SelectItem key={t} value={t}>
              {formatTime(t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
