import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import { signInEmail, welcomeEmail } from "@/lib/email/templates";
import crypto from 'crypto';
import type { User as PrismaUser } from '@prisma/client';
import type { JWT } from 'next-auth/jwt';

// Type declarations remain the same
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      onboarded: boolean;
      role?: string;
      preferences?: {
        language?: string;
        theme?: string;
      };
    }
  }

  interface User extends PrismaUser {
    id?: string;
    onboarded: boolean;
    role?: string;
    preferences?: {
      language?: string;
      theme?: string;
    };
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Email({
      from: process.env.RESEND_FROM!,
      maxAge: 24 * 60 * 60,
      generateVerificationToken: async () => {
        return crypto.randomUUID();
      },
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { 
            name: true,
            emailVerified: true,
          }
        });

        const emailTemplate = user?.name 
          ? signInEmail(user.name, url)
          : welcomeEmail("there");

        await sendEmail({
          to: email,
          from: process.env.RESEND_FROM!,
          template: emailTemplate,
        });
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    // Callbacks remain the same
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
            },
            create: {
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
            },
          });
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }

      if (account?.provider === "email") {
        if (!user.email) return false;
        
        try {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
              email: user.email,
            },
          });
          return true;
        } catch (error) {
          console.error('Error during email sign in:', error);
          return false;
        }
      }

      return false;
    },

    async session({ session, token }) {
      if (session?.user) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
          }
        });

        if (user) {
          session.user.id = user.id;
          session.user.name = user.name;
          session.user.email = user.email;
          session.user.image = user.image;
          session.user.onboarded = user.emailVerified != null;
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        const user = await prisma.user.findFirst({
          where: { 
            email: { not: null },
            emailVerified: null 
          },
        });

        if (user) {
          return `${baseUrl}/onboarding`;
        }
        return `${baseUrl}/dashboard`;
      }
      return baseUrl;
    }
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
};