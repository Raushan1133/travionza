import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useFavorites } from "@/context/favorites-context"
import { cn } from "@/lib/utils"

/** Heart toggle – state lives in FavoritesProvider (persisted to localStorage) */
export function FavoriteButton({
  carId,
  carName,
  className,
  variant = "overlay",
}: {
  carId: string
  carName: string
  className?: string
  variant?: "overlay" | "outline"
}) {
  const { isFavorite, toggle } = useFavorites()
  const active = isFavorite(carId)

  return (
    <Button
      type="button"
      variant={variant === "overlay" ? "secondary" : "outline"}
      size="icon-sm"
      aria-pressed={active}
      aria-label={active ? `Remove ${carName} from favorites` : `Save ${carName} to favorites`}
      onClick={(e) => {
        // The button usually sits inside a clickable card/link
        e.preventDefault()
        e.stopPropagation()
        toggle(carId, carName)
      }}
      className={cn(variant === "overlay" && "rounded-full bg-background/90 shadow-sm backdrop-blur hover:bg-background", className)}
    >
      <Heart className={cn("transition-all", active && "scale-110 fill-destructive text-destructive")} />
    </Button>
  )
}
