import * as React from "react"
import { CircleAlert } from "lucide-react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { Field } from "@/components/common/form-field"
import { PasswordInput } from "@/components/common/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { safeNext } from "@/lib/safe-redirect"

export default function RegisterPage() {
  useDocumentTitle("Create account")
  const { isAuthenticated, register } = useAuth()
  const navigate = useNavigate()
  const [sp] = useSearchParams()
  const next = safeNext(sp.get("next"), "/")

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string>()

  if (isAuthenticated && !pending) return <Navigate to={next} replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(undefined)
    setPending(true)
    try {
      const user = await register({ name, email, password })
      toast.success(`Welcome to Travionza, ${user.name.split(" ")[0]}!`, { description: "Use WELCOME10 for 10% off your first rental." })
      navigate(next, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setPending(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground">Join to unlock member deals and save your details.</p>
      </div>

      <form onSubmit={submit} noValidate className="space-y-4">
        <Field id="reg-name" label="Full name">
          <Input id="reg-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field id="reg-email" label="Email">
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field id="reg-password" label="Password" hint="At least 6 characters.">
          <PasswordInput
            id="reg-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" size="xl" className="w-full" loading={pending}>
          Create account
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link to="/legal/terms" target="_blank" className="font-medium text-foreground underline-offset-4 hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link to="/legal/privacy" target="_blank" className="font-medium text-foreground underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to={`/login${sp.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
