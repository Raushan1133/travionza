import type { ReactNode } from "react"
import { CircleAlert, SearchX, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface StateProps {
  title: string
  message?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

function State({ title, message, icon: Icon = SearchX, action, className, tone }: StateProps & { tone: "neutral" | "error" }) {
  return (
    <div className={cn("mx-auto flex max-w-md flex-col items-center px-4 py-12 text-center", className)}>
      <div
        className={cn(
          "mb-4 grid size-14 place-items-center rounded-2xl",
          tone === "error" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="size-7" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {message && <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** "Nothing here yet" – no results, empty favourites, no trips… */
export function EmptyState(props: StateProps) {
  return <State {...props} tone="neutral" />
}

/** Something failed – offer a retry when the caller can */
export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this right now. Please try again.",
  onRetry,
  ...rest
}: Partial<StateProps> & { onRetry?: () => void }) {
  return (
    <State
      title={title}
      message={message}
      icon={CircleAlert}
      tone="error"
      action={rest.action ?? (onRetry ? <Button onClick={onRetry}>Try again</Button> : undefined)}
      className={rest.className}
    />
  )
}
