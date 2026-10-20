import { Heart, LogOut, Luggage, Palette, UserRound } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { AppearanceSettings } from "@/components/account/appearance-settings"
import { ProfileForm } from "@/components/account/profile-form"
import { Container, PageHeader } from "@/components/common/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { useFavorites } from "@/context/favorites-context"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { formatDate, initials } from "@/lib/format"

export default function AccountPage() {
  useDocumentTitle("My account")
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { count } = useFavorites()
  if (!user) return null

  const signOut = async () => {
    await logout()
    navigate("/", { replace: true })
  }

  return (
    <Container className="max-w-4xl py-10">
      <PageHeader title="My account" crumbs={[{ label: "Home", to: "/" }, { label: "Account" }]} />

      <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5">
        <Avatar className="size-14">
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-lg font-semibold leading-tight">
            {user.name} <Badge variant="secondary">{user.tier} member</Badge>
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {user.email} · Member since {formatDate(user.memberSince, "MMM yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/trips">
              <Luggage /> My trips
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/favorites">
              <Heart /> Saved{count > 0 && ` (${count})`}
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="mt-8 gap-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-1.5">
            <UserRound className="size-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5">
            <Palette className="size-4" /> Appearance
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button variant="ghost" onClick={signOut} className="text-destructive hover:text-destructive">
          <LogOut /> Sign out
        </Button>
      </div>
    </Container>
  )
}
