import * as React from "react"
import { toast } from "sonner"

import { Field } from "@/components/common/form-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"

export function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = React.useState(user?.name ?? "")
  const [phone, setPhone] = React.useState(user?.phone ?? "")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string>()

  if (!user) return null
  const dirty = name.trim() !== user.name || phone.trim() !== (user.phone ?? "")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(undefined)
    if (!name.trim()) return setError("Your name can't be empty.")
    setSaving(true)
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() })
      toast.success("Profile updated")
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't save your changes.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal details</CardTitle>
        <CardDescription>Used to pre-fill the driver form at checkout.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="acc-name" label="Full name" error={error}>
              <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={Boolean(error) || undefined} />
            </Field>
            <Field id="acc-phone" label="Phone" optional>
              <Input id="acc-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            </Field>
          </div>
          <Field id="acc-email" label="Email" hint="Your email is your sign-in and can't be changed here.">
            <Input id="acc-email" value={user.email} readOnly disabled />
          </Field>
          <Button type="submit" loading={saving} disabled={!dirty}>
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
