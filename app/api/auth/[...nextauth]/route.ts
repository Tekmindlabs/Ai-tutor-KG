import NextAuth from "next-auth"
import { authConfig } from '@/auth.config'
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig
})

export { handler as GET, handler as POST }