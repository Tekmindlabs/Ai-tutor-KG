// components/auth/user-profile.tsx
"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={session.user.image || undefined} />
        <AvatarFallback>
          {session.user.name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{session.user.name}</span>
        <span className="text-xs text-muted-foreground">{session.user.email}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => signOut()}>
        Sign out
      </Button>
    </div>
  );
}