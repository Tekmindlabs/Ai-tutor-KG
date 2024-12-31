import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from './auth.config'
import { DefaultSession } from "next-auth"

export type Session = {
  user: {
    id: string;
    onboarded: boolean;
  } & DefaultSession["user"]
}

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  ...authConfig,
})

export const { auth, handlers, signIn, signOut } = nextAuth

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}