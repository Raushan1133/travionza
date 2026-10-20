import type { Location } from "@/types"

/** "Orlando (MCO)" */
export const locationLabel = (l: Pick<Location, "city" | "airportCode">) =>
  `${l.city} (${l.airportCode})`

/** "Orlando International Airport, Orlando, FL" */
export const locationFull = (l: Pick<Location, "city" | "state" | "airportName">) =>
  `${l.airportName}, ${l.city}, ${l.state}`
