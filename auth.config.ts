import Google from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { Session, User } from "next-auth";
import { prisma } from "@/lib/prisma";

// Define custom types
interface CustomSession extends Session {
  user?: {
    id: string;
    onboarded: boolean;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
}

interface CustomUser extends User {
  id: string;
  onboarded?: boolean;
}

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ 
      session, 
      user 
    }: { 
      session: CustomSession; 
      user: CustomUser 
    }): Promise<CustomSession> {
      if (session?.user) {
        session.user.id = user.id;
        
        // Check if user is onboarded
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            onboarded: true
          }
        });
        
        session.user.onboarded = dbUser?.onboarded ?? false;
      }
      return session;
    },
    async redirect({ 
      url, 
      baseUrl 
    }: { 
      url: string; 
      baseUrl: string 
    }): Promise<string> {
      if (url.startsWith(baseUrl)) {
        // Instead of using auth() directly, we'll handle the redirect logic
        // based on the URL pattern to avoid circular dependencies
        if (url.includes('/onboarding')) {
          return url;
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
} satisfies NextAuthConfig;

export default authConfig;