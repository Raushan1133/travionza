import { CreditCard, Lock } from "lucide-react"

import { Field } from "@/components/common/form-field"
import { Input } from "@/components/ui/input"

export interface PaymentValue {
  cardNumber: string
  name: string
  expiry: string
  cvc: string
}

export type PaymentErrors = Partial<Record<keyof PaymentValue, string>>

export const EMPTY_PAYMENT: PaymentValue = { cardNumber: "", name: "", expiry: "", cvc: "" }

/** "4242424242424242" → "4242 4242 4242 4242" */
const formatCard = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim()

/** "1226" → "12/26" */
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export function validatePayment(p: PaymentValue): PaymentErrors {
  const errors: PaymentErrors = {}
  if (!/^\d{13,19}$/.test(p.cardNumber.replace(/\s/g, ""))) errors.cardNumber = "Enter a valid card number."
  if (p.name.trim().length < 2) errors.name = "Enter the name on the card."
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(p.expiry)
  if (!m) errors.expiry = "Use MM/YY."
  else {
    const now = new Date()
    const year = 2000 + Number(m[2])
    if (year < now.getFullYear() || (year === now.getFullYear() && Number(m[1]) < now.getMonth() + 1)) {
      errors.expiry = "This card has expired."
    }
  }
  if (!/^\d{3,4}$/.test(p.cvc)) errors.cvc = "3–4 digits."
  return errors
}

export function PaymentForm({
  value,
  onChange,
  errors,
}: {
  value: PaymentValue
  onChange: (patch: Partial<PaymentValue>) => void
  errors: PaymentErrors
}) {
  return (
    <div className="space-y-4">
      <Field id="cardNumber" label="Card number" error={errors.cardNumber}>
        <div className="relative">
          <CreditCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="cardNumber"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            className="pl-9 tabular-nums"
            value={value.cardNumber}
            aria-invalid={errors.cardNumber ? true : undefined}
            onChange={(e) => onChange({ cardNumber: formatCard(e.target.value) })}
          />
        </div>
      </Field>
      <Field id="cardName" label="Name on card" error={errors.name}>
        <Input
          id="cardName"
          autoComplete="cc-name"
          value={value.name}
          aria-invalid={errors.name ? true : undefined}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id="expiry" label="Expiry" error={errors.expiry}>
          <Input
            id="expiry"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            className="tabular-nums"
            value={value.expiry}
            aria-invalid={errors.expiry ? true : undefined}
            onChange={(e) => onChange({ expiry: formatExpiry(e.target.value) })}
          />
        </Field>
        <Field id="cvc" label="Security code" error={errors.cvc}>
          <Input
            id="cvc"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            maxLength={4}
            className="tabular-nums"
            value={value.cvc}
            aria-invalid={errors.cvc ? true : undefined}
            onChange={(e) => onChange({ cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
          />
        </Field>
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" /> Demo mode: use 4242 4242 4242 4242 with any future date. 4000 0000 0000 0002 simulates a decline.
      </p>
    </div>
  )
}
