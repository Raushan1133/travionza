import * as React from "react"

import { STORAGE_KEYS } from "@/lib/constants"
import { readJSON, writeJSON } from "@/lib/storage"

export type ThemeMode = "light" | "dark" | "system"
export type Palette = "ocean" | "emerald" | "sunset" | "violet"

export const PALETTES: { id: Palette; label: string; description: string; swatch: string }[] = [
  { id: "ocean", label: "Ocean", description: "Calm, trustworthy blue", swatch: "oklch(0.56 0.19 258)" },
  { id: "emerald", label: "Emerald", description: "Fresh and eco-minded", swatch: "oklch(0.56 0.14 160)" },
  { id: "sunset", label: "Sunset", description: "Warm and energetic", swatch: "oklch(0.62 0.17 45)" },
  { id: "violet", label: "Violet", description: "Bold and premium", swatch: "oklch(0.56 0.2 292)" },
]

interface ThemeState {
  mode: ThemeMode
  palette: Palette
}

interface ThemeContextValue extends ThemeState {
  /** What is actually on screen right now (system resolved) */
  resolvedMode: "light" | "dark"
  setMode: (mode: ThemeMode) => void
  setPalette: (palette: Palette) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const DEFAULTS: ThemeState = { mode: "system", palette: "ocean" }

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
}

function resolve(mode: ThemeMode): "light" | "dark" {
  return mode === "system" ? (systemPrefersDark() ? "dark" : "light") : mode
}

function apply(state: ThemeState) {
  const root = document.documentElement
  const resolved = resolve(state.mode)
  root.classList.toggle("dark", resolved === "dark")
  root.setAttribute("data-theme", state.palette)
  root.style.colorScheme = resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ThemeState>(() => ({
    ...DEFAULTS,
    ...readJSON<Partial<ThemeState>>(STORAGE_KEYS.theme, {}),
  }))
  const [resolvedMode, setResolvedMode] = React.useState<"light" | "dark">(() => resolve(state.mode))

  React.useEffect(() => {
    apply(state)
    setResolvedMode(resolve(state.mode))
    writeJSON(STORAGE_KEYS.theme, state)
  }, [state])

  // Follow the OS setting while in "system" mode
  React.useEffect(() => {
    if (state.mode !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      apply(state)
      setResolvedMode(resolve("system"))
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [state])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      ...state,
      resolvedMode,
      setMode: (mode) => setState((s) => ({ ...s, mode })),
      setPalette: (palette) => setState((s) => ({ ...s, palette })),
    }),
    [state, resolvedMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>")
  return ctx
}
