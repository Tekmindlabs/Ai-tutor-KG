import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import type { NextAuthConfig } from "@auth/core";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import { signInEmail, welcomeEmail } from "@/lib/email/templates";
import crypto from 'crypto';
import type { User as PrismaUser } from '@prisma/client';
import type { JWT } from 'next-auth/jwt';
import type { Account, Session } from "next-auth";

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

  debug: true,

  providers: [

    Email({

      // Remove the server configuration as it's specific to Nodemailer

      from: process.env.RESEND_FROM!,

      maxAge: 24 * 60 * 60,

      generateVerificationToken: async () => {

        return crypto.randomUUID();

      },

      // Custom sendVerificationRequest using Resend

      async sendVerificationRequest({ identifier: email, url }) {

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


        try {

          await sendEmail({

            to: email,

            template: emailTemplate,

          });

        } catch (error) {

          throw new Error(`Error sending verification email: ${error}`);

        }

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
    async signIn({ user, account }: { user: User; account: Account | null }) {
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

    async session({ session, token }: { session: Session; token: JWT }) {
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

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    }
  }
};