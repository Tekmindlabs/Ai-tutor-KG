import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from './auth.config'
import { DefaultSession } from "next-auth"
import { getServerSession } from "next-auth"

// Define custom session type
export type Session = {
  user: {
    id: string;
    onboarded: boolean;
  } & DefaultSession["user"]
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
})

// Add the session utility functions here
export async function getSession() {
  return await getServerSession(authConfig);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}