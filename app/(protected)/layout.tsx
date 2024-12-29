// /app/(protected)/layout.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  if (!session.user?.onboarded) {
    redirect("/onboarding")
  }

  return <>{children}</>
}