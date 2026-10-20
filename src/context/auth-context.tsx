import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { api } from "@/services/api"
import { readSessionUser } from "@/mocks/db"
import type { User } from "@/types"
import { qk } from "@/hooks/queries"

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (input: { email: string; password: string }) => Promise<User>
  loginDemo: () => Promise<User>
  register: (input: { name: string; email: string; password: string }) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (patch: Partial<Pick<User, "name" | "phone">>) => Promise<User>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient()
  // Read synchronously so protected pages don't flash a redirect on refresh
  const [user, setUser] = React.useState<User | null>(() => readSessionUser())

  const login = React.useCallback(async (input: { email: string; password: string }) => {
    const u = await api.auth.login(input)
    setUser(u)
    return u
  }, [])

  const loginDemo = React.useCallback(async () => {
    const u = await api.auth.loginDemo()
    setUser(u)
    return u
  }, [])

  const register = React.useCallback(async (input: { name: string; email: string; password: string }) => {
    const u = await api.auth.register(input)
    setUser(u)
    return u
  }, [])

  const logout = React.useCallback(async () => {
    await api.auth.logout()
    setUser(null)
    qc.removeQueries({ queryKey: qk.bookings.all })
  }, [qc])

  const updateProfile = React.useCallback(
    async (patch: Partial<Pick<User, "name" | "phone">>) => {
      if (!user) throw new Error("Not signed in")
      const next = await api.auth.updateProfile(user, patch)
      setUser(next)
      return next
    },
    [user],
  )

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), login, loginDemo, register, logout, updateProfile }),
    [user, login, loginDemo, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>")
  return ctx
}
