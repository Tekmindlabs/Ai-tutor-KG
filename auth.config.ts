import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"
import { prisma } from "@/lib/prisma"

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
        
        // Check if user is onboarded
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { onboarded: true }
        });
        session.user.onboarded = dbUser?.onboarded || false;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        const session = await auth();
        if (session?.user && !session.user.onboarded) {
          return `${baseUrl}/onboarding`;
        }
        return `${baseUrl}/chat`;
      }
      return baseUrl;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
} satisfies NextAuthConfig