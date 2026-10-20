import * as React from "react"
import { useNavigation } from "react-router-dom"

/** Thin bar at the very top that shows while a route chunk is loading */
export function NavigationProgress() {
  const navigation = useNavigation()
  const busy = navigation.state !== "idle"
  const [visible, setVisible] = React.useState(false)

  // Small delay so instant navigations don't flash the bar
  React.useEffect(() => {
    if (!busy) {
      setVisible(false)
      return
    }
    const t = setTimeout(() => setVisible(true), 120)
    return () => clearTimeout(t)
  }, [busy])

  if (!visible) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-primary/15" role="progressbar" aria-label="Loading page">
      <div className="h-full w-full origin-left animate-[progress-indeterminate_1.1s_ease-in-out_infinite] bg-primary" />
    </div>
  )
}
