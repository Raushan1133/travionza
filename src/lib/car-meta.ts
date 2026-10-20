import { Bus, CarFront, Gem, Sun, Truck, Zap, Fuel, Leaf, Droplets, Car, type LucideIcon } from "lucide-react"

import type { CarCategory, FuelType, Transmission } from "@/types"

export const CATEGORIES: { id: CarCategory; label: string; icon: LucideIcon; blurb: string }[] = [
  { id: "economy", label: "Economy", icon: Car, blurb: "Small, thrifty, easy to park" },
  { id: "compact", label: "Compact", icon: Car, blurb: "Zippy and efficient" },
  { id: "sedan", label: "Sedan", icon: CarFront, blurb: "Comfortable for longer drives" },
  { id: "suv", label: "SUV", icon: CarFront, blurb: "Space, height and confidence" },
  { id: "minivan", label: "Minivan", icon: Bus, blurb: "Room for the whole crew" },
  { id: "luxury", label: "Luxury", icon: Gem, blurb: "Arrive in style" },
  { id: "convertible", label: "Convertible", icon: Sun, blurb: "Roof down, mood up" },
  { id: "truck", label: "Pickup", icon: Truck, blurb: "Haul it, tow it, load it" },
]

export const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<
  CarCategory,
  string
>

export const FUELS: { id: FuelType; label: string; icon: LucideIcon }[] = [
  { id: "petrol", label: "Petrol", icon: Fuel },
  { id: "diesel", label: "Diesel", icon: Droplets },
  { id: "hybrid", label: "Hybrid", icon: Leaf },
  { id: "electric", label: "Electric", icon: Zap },
]

export const FUEL_LABELS = Object.fromEntries(FUELS.map((f) => [f.id, f.label])) as Record<FuelType, string>
export const FUEL_ICONS = Object.fromEntries(FUELS.map((f) => [f.id, f.icon])) as Record<FuelType, LucideIcon>

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  automatic: "Automatic",
  manual: "Manual",
}

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
] as const
