import * as React from "react"

import type { CarBody } from "@/types"
import { cn } from "@/lib/utils"

/**
 * Original, generic side-profile illustrations tinted with the car's colour.
 * They are only a fallback for when a car has no photo yet (see CarImage).
 * Coordinates live in a 320 × 140 viewBox.
 */
const SHAPES: Record<CarBody, { body: string; glass: string[]; wheels: [number, number]; extra?: string }> = {
  hatchback: {
    body: "M16 102 L20 84 C22 78 30 76 38 76 L64 74 C76 54 96 44 120 42 L206 42 C226 42 240 56 250 72 L288 78 C302 81 306 92 306 102 L306 106 L16 106 Z",
    glass: ["M80 72 C90 58 102 50 120 49 L150 49 L150 72 Z", "M158 49 L204 49 C218 49 230 60 240 72 L158 72 Z"],
    wheels: [74, 244],
  },
  sedan: {
    body: "M14 100 C14 90 18 84 30 82 L66 76 C80 56 98 44 124 42 L190 42 C216 42 232 58 246 74 L286 80 C302 83 306 92 306 102 L306 106 L14 106 Z",
    glass: ["M84 74 C94 58 106 50 124 49 L158 49 L158 74 Z", "M166 49 L190 49 C206 49 218 60 230 74 L166 74 Z"],
    wheels: [76, 244],
  },
  suv: {
    body: "M14 100 L16 78 C16 70 22 66 30 66 L66 64 L80 46 C84 40 90 38 98 38 L214 38 C224 38 230 42 236 50 L252 66 L288 70 C302 72 306 82 306 96 L306 106 L14 106 Z",
    glass: ["M90 64 L100 46 L150 46 L150 64 Z", "M158 46 L212 46 L232 64 L158 64 Z"],
    wheels: [76, 246],
    extra: "M96 36 L212 36",
  },
  van: {
    body: "M12 100 L14 62 C14 50 22 42 34 40 L206 36 C222 36 232 42 240 54 L252 66 L292 72 C304 74 308 84 308 98 L308 106 L12 106 Z",
    glass: ["M28 48 L70 47 L70 66 L26 66 Z", "M78 47 L120 46 L120 66 L78 66 Z", "M128 46 L170 46 L170 66 L128 66 Z", "M178 46 L214 45 C222 46 228 52 234 66 L178 66 Z"],
    wheels: [76, 246],
  },
  luxury: {
    body: "M10 102 C10 92 14 88 24 86 L70 80 C90 60 110 46 140 42 L196 42 C222 44 240 62 254 78 L296 84 C308 86 312 94 312 102 L312 106 L10 106 Z",
    glass: ["M92 76 C104 60 120 50 142 48 L164 48 L164 76 Z", "M172 48 L194 48 C212 50 226 62 240 77 L172 77 Z"],
    wheels: [74, 250],
    extra: "M30 92 L296 92",
  },
  convertible: {
    body: "M12 102 C12 92 16 88 26 86 L90 78 L126 62 L142 60 L150 74 L270 80 C298 84 308 90 308 102 L308 106 L12 106 Z",
    glass: ["M126 62 L140 52 L148 72 L134 74 Z"],
    wheels: [72, 246],
    extra: "M162 70 L176 58 L190 58 L192 72 Z",
  },
  pickup: {
    body: "M12 100 L14 80 C14 74 20 70 28 70 L60 68 L74 48 C78 42 84 40 92 40 L160 40 C170 40 176 44 182 52 L192 68 L300 70 C306 71 308 76 308 84 L308 106 L12 106 Z",
    glass: ["M84 66 L92 48 L140 48 L140 66 Z", "M148 48 L162 48 L178 66 L148 66 Z"],
    wheels: [72, 250],
    extra: "M198 72 L304 72 L304 86 L198 86 Z",
  },
}

interface CarIllustrationProps {
  body: CarBody
  color: string
  name: string
  className?: string
}

/** The vector placeholder. Used as a fallback and for decorative artwork. */
export function CarIllustration({ body, color, name, className }: CarIllustrationProps) {
  const uid = React.useId().replace(/:/g, "")
  const shape = SHAPES[body] ?? SHAPES.sedan

  return (
    <svg viewBox="0 0 320 140" role="img" aria-label={name} className={cn("h-auto w-full select-none", className)}>
      <defs>
        <linearGradient id={`shade-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".38" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".28" />
        </linearGradient>
        <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dbeafe" stopOpacity=".95" />
          <stop offset="1" stopColor="#4b6a8a" stopOpacity=".95" />
        </linearGradient>
      </defs>

      <ellipse cx="162" cy="121" rx="142" ry="6" fill="#000" opacity=".2" />

      <path d={shape.body} fill={color} />
      <path d={shape.body} fill={`url(#shade-${uid})`} />
      {shape.extra && (
        <path
          d={shape.extra}
          fill={body === "pickup" || body === "convertible" ? "#000" : "none"}
          fillOpacity={0.28}
          stroke="#000"
          strokeOpacity={body === "suv" || body === "luxury" ? 0.35 : 0}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
      {shape.glass.map((d, i) => (
        <path key={i} d={d} fill={`url(#glass-${uid})`} />
      ))}

      <rect x="300" y="84" width="9" height="5" rx="2" fill="#fde68a" />
      <rect x="12" y="86" width="8" height="5" rx="2" fill="#ef4444" />

      {shape.wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="102" r="23" fill="#000" opacity=".32" />
          <circle cx={cx} cy="102" r="18" fill="#111827" />
          <circle cx={cx} cy="102" r="10" fill="#cbd5e1" />
          <circle cx={cx} cy="102" r="4" fill="#64748b" />
        </g>
      ))}
    </svg>
  )
}

/** Where a car's photo lives when the data doesn't specify `images`. */
export const carPhotoPath = (carId: string) => `/cars/${carId}.jpg`

interface CarImageProps {
  /** Used to find /public/cars/<carId>.jpg when `images` isn't given */
  carId?: string
  /** Explicit photo URLs (local or remote). The first one is shown. */
  images?: string[]
  name: string
  /** Fallback illustration, shown only while a photo is missing */
  body: CarBody
  color: string
  /** Applied to the frame – override the aspect ratio or rounding here */
  className?: string
  /** Applied to the photo itself – e.g. a hover zoom */
  imgClassName?: string
  /** Load eagerly for above-the-fold images */
  priority?: boolean
}

/**
 * A fixed-ratio frame that shows the car's real photo, with a skeleton while
 * it loads. If the photo is missing or fails to load, it quietly falls back to
 * the illustration so the layout never breaks.
 */
export function CarImage({ carId, images, name, body, color, className, imgClassName, priority }: CarImageProps) {
  const src = images?.[0] ?? (carId ? carPhotoPath(carId) : undefined)
  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden bg-linear-to-b from-accent/70 to-muted/30",
        className,
      )}
    >
      {/* key: a new src starts from a clean loading state */}
      <CarPhoto
        key={src ?? "none"}
        src={src}
        name={name}
        body={body}
        color={color}
        className={imgClassName}
        priority={priority}
      />
    </div>
  )
}

function CarPhoto({
  src,
  name,
  body,
  color,
  className,
  priority,
}: {
  src?: string
  name: string
  body: CarBody
  color: string
  className?: string
  priority?: boolean
}) {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">(src ? "loading" : "error")
  const ref = React.useRef<HTMLImageElement>(null)

  // Cached images can finish before React attaches onLoad
  React.useEffect(() => {
    const img = ref.current
    if (img?.complete) setStatus(img.naturalWidth > 0 ? "loaded" : "error")
  }, [])

  if (status === "error" || !src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-[7%]">
        <CarIllustration body={body} color={color} name={name} className={className} />
      </div>
    )
  }

  return (
    <>
      {status === "loading" && <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden />}
      <img
        ref={ref}
        src={src}
        alt={name}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          status === "loaded" ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  )
}
