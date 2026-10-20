import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react"

import { PALETTES, useTheme, type ThemeMode } from "@/components/theme/theme-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const MODES: { id: ThemeMode; label: string; icon: LucideIcon }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
]

/** Larger version of the navbar theme menu: light / dark / system + brand palette */
export function AppearanceSettings() {
  const { mode, setMode, palette, setPalette } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Changes apply instantly and are remembered on this device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section aria-labelledby="mode-label">
          <h3 id="mode-label" className="mb-3 text-sm font-medium">
            Mode
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={mode === id}
                onClick={() => setMode(id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-colors",
                  mode === id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                )}
              >
                <Icon className="size-5" /> {label}
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="palette-label">
          <h3 id="palette-label" className="mb-3 text-sm font-medium">
            Colour theme
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={palette === p.id}
                onClick={() => setPalette(p.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors",
                  palette === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg text-white" style={{ background: p.swatch }}>
                  {palette === p.id && <Check className="size-4" />}
                </span>
                <span className="min-w-0 text-sm">
                  <span className="block font-medium">{p.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{p.description}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
