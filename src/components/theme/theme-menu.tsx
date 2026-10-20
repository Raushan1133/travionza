import { Check, Monitor, Moon, Palette as PaletteIcon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PALETTES, useTheme, type ThemeMode } from "@/components/theme/theme-provider"
import { cn } from "@/lib/utils"

/** Navbar dropdown: light / dark / system + brand colour */
export function ThemeMenu({ className }: { className?: string }) {
  const { mode, setMode, palette, setPalette, resolvedMode } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change appearance" className={className}>
          {resolvedMode === "dark" ? <Moon /> : <Sun />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Mode</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={mode} onValueChange={(v) => setMode(v as ThemeMode)}>
          <DropdownMenuRadioItem value="light">
            <Sun className="size-4" /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="size-4" /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="size-4" /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <PaletteIcon className="size-3.5" /> Colour theme
        </DropdownMenuLabel>
        <div className="grid grid-cols-4 gap-2 p-2">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPalette(p.id)}
              title={`${p.label} – ${p.description}`}
              aria-label={`${p.label} theme`}
              aria-pressed={palette === p.id}
              className={cn(
                "relative grid aspect-square place-items-center rounded-xl border-2 transition-transform hover:scale-105 focus-visible:outline-2",
                palette === p.id ? "border-foreground" : "border-transparent",
              )}
              style={{ background: p.swatch }}
            >
              {palette === p.id && <Check className="size-4 text-white drop-shadow" />}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
