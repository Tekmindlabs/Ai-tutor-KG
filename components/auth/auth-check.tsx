// components/auth/auth-check.tsx
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface AuthCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthCheck({ children, redirectTo = "/auth/signin" }: AuthCheckProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!session) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}