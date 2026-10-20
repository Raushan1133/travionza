import * as React from "react"
import { toast } from "sonner"

import { STORAGE_KEYS } from "@/lib/constants"
import { readJSON, writeJSON } from "@/lib/storage"

interface FavoritesContextValue {
  ids: string[]
  count: number
  isFavorite: (id: string) => boolean
  toggle: (id: string, name?: string) => void
  clear: () => void
}

const FavoritesContext = React.createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = React.useState<string[]>(() => readJSON<string[]>(STORAGE_KEYS.favorites, []))

  React.useEffect(() => {
    writeJSON(STORAGE_KEYS.favorites, ids)
  }, [ids])

  const toggle = React.useCallback(
    (id: string, name?: string) => {
      const has = ids.includes(id)
      setIds(has ? ids.filter((x) => x !== id) : [id, ...ids])
      toast(has ? "Removed from favorites" : "Saved to favorites", { description: name })
    },
    [ids],
  )

  const value = React.useMemo<FavoritesContextValue>(
    () => ({
      ids,
      count: ids.length,
      isFavorite: (id) => ids.includes(id),
      toggle,
      clear: () => setIds([]),
    }),
    [ids, toggle],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = React.useContext(FavoritesContext)
  if (!ctx) throw new Error("useFavorites must be used within <FavoritesProvider>")
  return ctx
}
