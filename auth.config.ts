import type { NextAuthConfig } from "@auth/core";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import { signInEmail, welcomeEmail } from "@/lib/email/templates";
import crypto from 'crypto';
import type { User as PrismaUser } from '@prisma/client';
import type { JWT } from 'next-auth/jwt';
import type { Account, Session, User } from "next-auth";

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
  }
}

export const authConfig: NextAuthConfig = {
  debug: true,
  providers: [
    {
      id: "email",
      type: "email",
      from: process.env.RESEND_FROM!,
      server: {
        async send(options: { to: string; subject: string; html: string }) {
          const { to, subject, html } = options;
          try {
            await sendEmail({
              to,
              template: {
                subject,
                html
              },
            });
          } catch (error) {
            console.error('Email send error:', error);
            throw new Error(`Error sending verification email: ${error}`);
          }
        }
      },
      maxAge: 24 * 60 * 60,
      generateVerificationToken: async () => {
        return crypto.randomBytes(32).toString('hex');
      },
      async sendVerificationRequest({ 
        identifier: email, 
        url 
      }: { 
        identifier: string; 
        url: string 
      }) {
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
          console.error('Verification email error:', error);
          throw new Error(`Error sending verification email: ${error}`);
        }
      },
    },
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Make sure authorization includes proper scope and response type
      authorization: {
        params: {
          scope: "openid email profile",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ 
      token, 
      user, 
      account 
    }: { 
      token: JWT; 
      user: User | null; 
      account: Account | null 
    }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    
    async signIn({ 
      user, 
      account 
    }: { 
      user: User; 
      account: Account | null 
    }) {
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
              role: 'USER',
            },
          });
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }

      return false;
    },

    async session({ 
      session, 
      token 
    }: { 
      session: Session; 
      token: JWT 
    }) {
      if (session?.user) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.sub! },
            select: {
              id: true,
              name: true,
              email: true,
              emailVerified: true,
              image: true,
              role: true,
            }
          });

          if (user) {
            session.user = {
              ...session.user,
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              onboarded: user.emailVerified != null,
              role: user.role,
            };
          }
        } catch (error) {
          console.error('Session user fetch error:', error);
        }
      }
      return session;
    },

    async redirect({ 
      url, 
      baseUrl 
    }: { 
      url: string; 
      baseUrl: string 
    }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      else if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    }
  },
};