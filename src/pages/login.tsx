import * as React from "react"
import { CircleAlert, Sparkles } from "lucide-react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { Field } from "@/components/common/form-field"
import { PasswordInput } from "@/components/common/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { safeNext } from "@/lib/safe-redirect"

export default function LoginPage() {
  useDocumentTitle("Sign in")
  const { isAuthenticated, login, loginDemo } = useAuth()
  const navigate = useNavigate()
  const [sp] = useSearchParams()
  const next = safeNext(sp.get("next"))

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [pending, setPending] = React.useState<"login" | "demo" | null>(null)
  const [error, setError] = React.useState<string>()

  if (isAuthenticated && !pending) return <Navigate to={next} replace />

  const run = async (kind: "login" | "demo") => {
    setError(undefined)
    setPending(kind)
    try {
      const user = kind === "demo" ? await loginDemo() : await login({ email, password })
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`)
      navigate(next, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
      setPending(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to manage trips and check out faster.</p>
      </div>

      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          run("login")
        }}
      >
        <Field id="login-email" label="Email">
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field id="login-password" label="Password">
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
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

        <Button type="submit" size="xl" className="w-full" loading={pending === "login"} disabled={pending !== null}>
          Sign in
        </Button>
      </form>

      <div className="relative text-center">
        <span className="absolute inset-x-0 top-1/2 border-t" />
        <span className="relative bg-background px-3 text-xs uppercase tracking-wide text-muted-foreground">or</span>
      </div>

      

      <p className="text-center text-sm text-muted-foreground">
        New to Travionza?{" "}
        <Link to={`/register${sp.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
