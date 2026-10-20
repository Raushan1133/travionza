import type { DriverDetails } from "@/types"
import { Field } from "@/components/common/form-field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { COUNTRIES } from "@/lib/constants"

export const AGE_BANDS = [
  { value: "18-20", label: "18 – 20", max: 20 },
  { value: "21-24", label: "21 – 24", max: 24 },
  { value: "25-69", label: "25 – 69", max: 69 },
  { value: "70+", label: "70 or older", max: 120 },
]

export type DriverErrors = Partial<Record<keyof DriverDetails, string>>

export function validateDriver(d: DriverDetails, minAge: number): DriverErrors {
  const errors: DriverErrors = {}
  if (!d.firstName.trim()) errors.firstName = "Enter the driver's first name."
  if (!d.lastName.trim()) errors.lastName = "Enter the driver's last name."
  if (!/^\S+@\S+\.\S+$/.test(d.email)) errors.email = "Enter a valid email address."
  if (d.phone.replace(/\D/g, "").length < 7) errors.phone = "Enter a valid phone number."
  if (!d.licenseCountry) errors.licenseCountry = "Choose the country that issued the licence."
  const band = AGE_BANDS.find((b) => b.value === d.age)
  if (!band) errors.age = "Select the driver's age."
  else if (band.max < minAge) errors.age = `Drivers must be ${minAge}+ to rent this car.`
  return errors
}

interface DriverFormProps {
  value: DriverDetails
  onChange: (patch: Partial<DriverDetails>) => void
  errors: DriverErrors
  minAge: number
}

export function DriverForm({ value, onChange, errors, minAge }: DriverFormProps) {
  const invalid = (k: keyof DriverDetails) => (errors[k] ? true : undefined)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="firstName" label="First name" error={errors.firstName}>
        <Input
          id="firstName"
          autoComplete="given-name"
          value={value.firstName}
          aria-invalid={invalid("firstName")}
          onChange={(e) => onChange({ firstName: e.target.value })}
        />
      </Field>
      <Field id="lastName" label="Last name" error={errors.lastName}>
        <Input
          id="lastName"
          autoComplete="family-name"
          value={value.lastName}
          aria-invalid={invalid("lastName")}
          onChange={(e) => onChange({ lastName: e.target.value })}
        />
      </Field>
      <Field id="email" label="Email" error={errors.email} hint="We'll send your confirmation here.">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={value.email}
          aria-invalid={invalid("email")}
          onChange={(e) => onChange({ email: e.target.value })}
        />
      </Field>
      <Field id="phone" label="Mobile phone" error={errors.phone}>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={value.phone}
          aria-invalid={invalid("phone")}
          onChange={(e) => onChange({ phone: e.target.value })}
        />
      </Field>

      <Field id="licenseCountry" label="Driving licence country" error={errors.licenseCountry}>
        <Select value={value.licenseCountry} onValueChange={(v) => onChange({ licenseCountry: v })}>
          <SelectTrigger id="licenseCountry" className="w-full" aria-invalid={invalid("licenseCountry")}>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field id="age" label="Driver's age" error={errors.age}>
        <Select value={value.age} onValueChange={(v) => onChange({ age: v })}>
          <SelectTrigger id="age" className="w-full" aria-invalid={invalid("age")}>
            <SelectValue placeholder="Select age" />
          </SelectTrigger>
          <SelectContent>
            {AGE_BANDS.map((b) => (
              <SelectItem key={b.value} value={b.value} disabled={b.max < minAge}>
                {b.label}
                {b.max < minAge ? ` (min. ${minAge})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field id="flightNumber" label="Flight number" optional hint="Helps us track delays at airport pick-ups.">
        <Input
          id="flightNumber"
          value={value.flightNumber ?? ""}
          onChange={(e) => onChange({ flightNumber: e.target.value.toUpperCase() })}
        />
      </Field>
      <Field id="notes" label="Notes for the branch" optional>
        <Textarea
          id="notes"
          rows={1}
          value={value.notes ?? ""}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </Field>
    </div>
  )
}
