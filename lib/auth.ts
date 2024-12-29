import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"
import { DefaultSession, NextAuthConfig } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      onboarded: boolean;
    } & DefaultSession["user"]
  }
}

export type Session = {
  user: {
    id: string;
    onboarded: boolean;
  } & DefaultSession["user"]
}

export const config = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);