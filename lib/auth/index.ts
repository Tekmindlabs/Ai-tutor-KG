// /lib/auth/index.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      // Check if user needs onboarding
      if (url.startsWith(baseUrl)) {
        const session = await getServerSession(authOptions);
        if (session?.user && !session.user.onboarded) {
          return `${baseUrl}/onboarding`;
        }
        return `${baseUrl}/chat`; // Default landing page is chat
      }
      return baseUrl;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};