// components/auth/server-auth-check.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

interface ServerAuthCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export async function ServerAuthCheck({ 
  children, 
  redirectTo = "/auth/signin" 
}: ServerAuthCheckProps) {
  const session = await auth();

  if (!session) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}