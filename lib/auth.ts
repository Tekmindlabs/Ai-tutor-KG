import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "../lib/prisma"  // or "./prisma" if in same directory
import { authConfig } from "../auth.config"  // adjust path based on file location
import { Adapter } from "next-auth/adapters"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  ...authConfig,
})