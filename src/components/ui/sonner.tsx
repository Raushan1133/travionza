import type { CSSProperties } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { useTheme } from "@/components/theme/theme-provider"

/** Toasts follow the resolved light/dark mode and use our design tokens */
function Toaster(props: ToasterProps) {
  const { resolvedMode } = useTheme()

  return (
    <Sonner
      theme={resolvedMode}
      className="toaster group"
      position="bottom-right"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
